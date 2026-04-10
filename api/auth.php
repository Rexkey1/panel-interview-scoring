<?php
// api/auth.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $input = getJsonInput();
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'Please fill all fields'], 400);
    }

    $stmt = $pdo->prepare("SELECT id, name, username, password_hash, role, is_active FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        if ((int)$user['is_active'] !== 1) {
            jsonResponse(['error' => 'Account inactive. Contact admin.'], 403);
        }

        // Setup session
        $_SESSION['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
        ];

        session_regenerate_id(true);

        jsonResponse([
            'message' => 'Login successful',
            'user' => clone_user_without_hash($user)
        ]);
    } else {
        jsonResponse(['error' => 'Invalid username or password'], 401);
    }
} elseif ($method === 'POST' && $action === 'logout') {
    // Logout logic
    $_SESSION = [];
    session_destroy();
    jsonResponse(['message' => 'Logged out successfully']);
} elseif ($method === 'GET' && $action === 'me') {
    if (isset($_SESSION['user'])) {
        jsonResponse([
            'user' => $_SESSION['user']
        ]);
    } else {
        jsonResponse(['error' => 'Not logged in'], 401);
    }
} elseif ($method === 'POST' && $action === 'change_credentials') {
    if (!isset($_SESSION['user'])) {
        jsonResponse(['error' => 'Not authenticated'], 401);
    }
    $input = getJsonInput();
    $currentPassword = $input['current_password'] ?? '';
    $newUsername     = trim($input['new_username'] ?? '');
    $newPassword     = $input['new_password'] ?? '';

    if (empty($currentPassword)) {
        jsonResponse(['error' => 'Current password is required'], 400);
    }
    if (empty($newUsername) && empty($newPassword)) {
        jsonResponse(['error' => 'Provide a new username or new password'], 400);
    }

    // Verify current password
    $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        jsonResponse(['error' => 'Current password is incorrect'], 403);
    }

    // Build update
    if ($newUsername && $newPassword) {
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET username=?, password_hash=? WHERE id=?");
        $stmt->execute([$newUsername, $hash, $user['id']]);
        $_SESSION['user']['username'] = $newUsername;
    } elseif ($newUsername) {
        $stmt = $pdo->prepare("UPDATE users SET username=? WHERE id=?");
        $stmt->execute([$newUsername, $user['id']]);
        $_SESSION['user']['username'] = $newUsername;
    } else {
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash=? WHERE id=?");
        $stmt->execute([$hash, $user['id']]);
    }

    jsonResponse(['message' => 'Credentials updated successfully. Please log in again.']);
} else {
    jsonResponse(['error' => 'Endpoint not found'], 404);
}

function clone_user_without_hash($user) {
    unset($user['password_hash']);
    return $user;
}
