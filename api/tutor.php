<?php
// api/tutor.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_role_api('tutor');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$tutor_id = $_SESSION['user']['id'];

if ($method === 'GET' && $action === 'pending_applicants') {
    // Applicants the tutor hasn't scored yet
    $stmt = $pdo->prepare("
        SELECT a.* 
        FROM applicants a
        LEFT JOIN scores s ON s.applicant_id = a.id AND s.tutor_id = ?
        WHERE s.id IS NULL AND a.is_frozen = 0 AND a.is_active = 1
        ORDER BY a.created_at ASC
    ");
    $stmt->execute([$tutor_id]);
    $applicants = $stmt->fetchAll();
    
    jsonResponse(['applicants' => $applicants]);

} elseif ($method === 'GET' && $action === 'scored_applicants') {
    // Applicants the tutor has scored
    $stmt = $pdo->prepare("
        SELECT a.applicant_name, s.appearance, s.self_expression, s.current_affairs, s.total_score, s.created_at
        FROM scores s
        JOIN applicants a ON a.id = s.applicant_id
        WHERE s.tutor_id = ?
        ORDER BY s.created_at DESC
    ");
    $stmt->execute([$tutor_id]);
    $scores = $stmt->fetchAll();
    
    jsonResponse(['scores' => $scores]);

} elseif ($method === 'GET' && $action === 'applicant') {
    // Get single applicant info
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT * FROM applicants WHERE id=? AND is_active=1");
    $stmt->execute([$id]);
    $app = $stmt->fetch();
    
    if (!$app || (int)$app['is_frozen'] === 1) {
        jsonResponse(['error' => 'Applicant is unavailable or scoring is locked.'], 403);
    }
    
    // Ensure not already scored
    $stmt = $pdo->prepare("SELECT id FROM scores WHERE applicant_id=? AND tutor_id=?");
    $stmt->execute([$id, $tutor_id]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'You have already submitted a score for this applicant.'], 403);
    }
    
    jsonResponse(['applicant' => $app]);

} elseif ($method === 'POST' && $action === 'submit_score') {
    $input = getJsonInput();
    $id = (int)($input['applicant_id'] ?? 0);
    $appr = (int)($input['appearance'] ?? 0);
    $expr = (int)($input['expression'] ?? 0);
    $curr = (int)($input['current_affairs'] ?? 0);
    $comment = trim($input['comment'] ?? '');
    $remarks = $input['remarks'] ?? [];
    
    $total = $appr + $expr + $curr;

    // Validation
    $stmt = $pdo->prepare("SELECT is_frozen FROM applicants WHERE id=? AND is_active=1");
    $stmt->execute([$id]);
    $app = $stmt->fetch();
    
    if (!$app || (int)$app['is_frozen'] === 1) {
        jsonResponse(['error' => 'Applicant is unavailable or scoring is locked.'], 403);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM scores WHERE applicant_id=? AND tutor_id=?");
    $stmt->execute([$id, $tutor_id]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'You have already submitted a score for this applicant.'], 403);
    }

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("INSERT INTO scores (applicant_id, tutor_id, appearance, self_expression, current_affairs, total_score, remarks_json, comment, created_at) VALUES (?,?,?,?,?,?,?,?,NOW())");
        $stmt->execute([$id, $tutor_id, $appr, $expr, $curr, $total, json_encode($remarks), $comment]);

        require_once __DIR__ . '/panel.php';
        recalc_applicant_completion($pdo, $id);
        
        $pdo->commit();
        jsonResponse(['message' => 'Score submitted successfully.']);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Submission failed: ' . $e->getMessage()], 500);
    }
} else {
    jsonResponse(['error' => 'Endpoint not found'], 404);
}
