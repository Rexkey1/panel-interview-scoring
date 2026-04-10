<?php
// api/admin.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_role_api('admin');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'dashboard') {
    $totApplicants = (int)$pdo->query("SELECT COUNT(*) c FROM applicants WHERE is_active=1")->fetch()['c'];
    $activeTutors   = (int)$pdo->query("SELECT COUNT(*) c FROM users WHERE role='tutor' AND is_active=1")->fetch()['c'];
    $totSubs        = (int)$pdo->query("SELECT COUNT(*) c FROM scores")->fetch()['c'];
    $completed      = (int)$pdo->query("SELECT COUNT(*) c FROM applicants WHERE panel_status='COMPLETED'")->fetch()['c'];
    $pending        = (int)$pdo->query("SELECT COUNT(*) c FROM applicants WHERE panel_status='PENDING'")->fetch()['c'];

    jsonResponse([
        'stats' => [
            'total_applicants' => $totApplicants,
            'active_tutors' => $activeTutors,
            'total_submissions' => $totSubs,
            'completed' => $completed,
            'pending' => $pending
        ]
    ]);
} elseif ($method === 'GET' && $action === 'applicants') {
    $q = trim($_GET['q'] ?? '');
    
    $where = "is_active=1";
    $params = [];
    if ($q !== '') {
        $where .= " AND (applicant_name LIKE ? OR applicant_code LIKE ?)";
        // In case they have moh_pin/program
        $where = "is_active=1 AND (applicant_name LIKE ? OR IFNULL(applicant_code,'') LIKE ? )";
        $params = ["%$q%", "%$q%"];
    }

    $stmt = $pdo->prepare("
        SELECT a.*, 
            (SELECT COALESCE(AVG(total_score),0) FROM scores s WHERE s.applicant_id=a.id) AS panel_avg,
            (SELECT COALESCE(SUM(total_score),0) FROM scores s WHERE s.applicant_id=a.id) AS panel_total
        FROM applicants a 
        WHERE $where 
        ORDER BY a.created_at DESC
    ");
    $stmt->execute($params);
    jsonResponse(['applicants' => $stmt->fetchAll()]);
} elseif ($method === 'GET' && $action === 'tutors') {
    $stmt = $pdo->query("SELECT id, name, username, is_active, created_at FROM users WHERE role='tutor' ORDER BY name ASC");
    jsonResponse(['tutors' => $stmt->fetchAll()]);
} elseif ($method === 'GET' && $action === 'exports_data') {
    $stmt = $pdo->query("
        SELECT a.applicant_name, a.applicant_code, a.panel_status, 
               u.name as tutor_name, s.appearance, s.self_expression, s.current_affairs, s.total_score, s.remarks_json, s.comment
        FROM applicants a
        LEFT JOIN scores s ON s.applicant_id = a.id
        LEFT JOIN users u ON u.id = s.tutor_id
        ORDER BY a.applicant_name ASC
    ");
    jsonResponse(['data' => $stmt->fetchAll()]);
} elseif ($method === 'GET' && $action === 'settings') {
    $settings = $pdo->query("SELECT * FROM settings WHERE id=1")->fetch();
    jsonResponse(['settings' => $settings]);
} elseif ($method === 'POST' && in_array($action, ['delete_applicant', 'reset_applicant', 'delete_tutor', 'toggle_tutor', 'save_tutor', 'settings', 'edit_applicant'])) {
    $input = getJsonInput();
    $id = (int)($input['id'] ?? 0);
    
    if (!$id) jsonResponse(['error' => 'ID required'], 400);

    if ($action === 'delete_applicant') {
        $stmt = $pdo->prepare("DELETE FROM applicants WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Applicant deleted.']);
    } elseif ($action === 'reset_applicant') {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("DELETE FROM scores WHERE applicant_id = ?");
        $stmt->execute([$id]);
        $stmt = $pdo->prepare("UPDATE applicants SET panel_status='PENDING', is_frozen=0, completed_at=NULL WHERE id = ?");
        $stmt->execute([$id]);
        $pdo->commit();
        jsonResponse(['message' => 'Applicant reset.']);
    } elseif ($action === 'edit_applicant') {
        $name = trim($input['applicant_name'] ?? '');
        $code = trim($input['applicant_code'] ?? '');
        $program = trim($input['program'] ?? '');
        if (!$name) jsonResponse(['error' => 'Name required'], 400);
        $stmt = $pdo->prepare("UPDATE applicants SET applicant_name=?, applicant_code=?, program=? WHERE id=?");
        $stmt->execute([$name, $code ?: null, $program ?: null, $id]);
        jsonResponse(['message' => 'Applicant updated.']);
    } elseif ($action === 'delete_tutor') {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role='tutor'");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Tutor deleted.']);
    } elseif ($action === 'toggle_tutor') {
        $stmt = $pdo->prepare("UPDATE users SET is_active = NOT is_active WHERE id = ? AND role='tutor'");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Tutor access toggled.']);
    } elseif ($action === 'save_tutor') {
        $name = trim($input['name'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        
        if (!$name || !$username) jsonResponse(['error' => 'Name and username required'], 400);

        if ($id) {
            // Edit
            if ($password !== '') {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET name=?, username=?, password_hash=? WHERE id=? AND role='tutor'");
                $stmt->execute([$name, $username, $hash, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET name=?, username=? WHERE id=? AND role='tutor'");
                $stmt->execute([$name, $username, $id]);
            }
            jsonResponse(['message' => 'Tutor updated.']);
        } else {
            // Add
            if (!$password) jsonResponse(['error' => 'Password required for new tutors'], 400);
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (name, username, password_hash, role, is_active, created_at) VALUES (?, ?, ?, 'tutor', 1, NOW())");
            try {
                $stmt->execute([$name, $username, $hash]);
                jsonResponse(['message' => 'Tutor created.']);
            } catch(PDOException $e) {
                if ($e->getCode() == 23000) jsonResponse(['error' => 'Username already taken'], 400);
                jsonResponse(['error' => 'Database error'], 500);
            }
        }
    } elseif ($action === 'settings') {
        $mode = $input['completion_mode'] ?? 'ALL_ACTIVE_TUTORS';
        $min = (int)($input['minimum_required_tutors'] ?? 0);
        if (!in_array($mode, ['ALL_ACTIVE_TUTORS', 'MINIMUM_REQUIRED'], true)) $mode = 'ALL_ACTIVE_TUTORS';
        if ($min < 0) $min = 0;
        $stmt = $pdo->prepare("UPDATE settings SET completion_mode=?, minimum_required_tutors=? WHERE id=1");
        $stmt->execute([$mode, $min]);
        jsonResponse(['message' => 'Settings updated.']);
    }
} elseif ($method === 'POST' && in_array($action, ['upload_manual', 'upload_csv'])) {
    if ($action === 'upload_manual') {
        $input = getJsonInput();
        $name = trim($input['applicant_name'] ?? '');
        $code = trim($input['applicant_code'] ?? '');
        $program = trim($input['program'] ?? '');

        if ($name !== '') {
            $st = $pdo->prepare("INSERT INTO applicants (applicant_name, applicant_code, program, created_at) VALUES (?,?,?,NOW())");
            $st->execute([$name, $code ?: null, $program ?: 'General Nursing']);
            jsonResponse(['message' => 'Applicant added successfully.']);
        } else {
            jsonResponse(['error' => 'Name required'], 400);
        }
    } elseif ($action === 'upload_csv') {
        if (!empty($_FILES['csv_file']['tmp_name'])) {
            $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
            $header = fgetcsv($file); 

            $count = 0;
            while (($row = fgetcsv($file)) !== false) {
                if (empty($row[0])) continue;
                $st = $pdo->prepare("INSERT INTO applicants (applicant_name, applicant_code, created_at) VALUES (?,?,NOW())");
                try {
                    $st->execute([$row[0], $row[1] ?? null]);
                    $count++;
                } catch(Exception $e) {
                    continue; // Skip duplicates or errors
                }
            }
            fclose($file);
            jsonResponse(['message' => "Imported $count applicants."]);
        } else {
            jsonResponse(['error' => 'No file uploaded'], 400);
        }
    }
} else {
    jsonResponse(['error' => 'Endpoint not found'], 404);
}
