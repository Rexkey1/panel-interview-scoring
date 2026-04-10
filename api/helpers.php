<?php
// api/helpers.php

// Start session if not started
$configPath = __DIR__ . '/config.php';
$config = require $configPath;
$sessionName = $config['app']['session_name'] ?? 'PANEL_SCORING_SESS';
session_name($sessionName);

// Adjust session cookie params to allow cross-origin logic if same-site
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'secure' => false, // Set to true if HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Send JSON response and exit
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Get body for POST requests since React uses fetch/axios with JSON
 */
function getJsonInput() {
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?: [];
}

/**
 * Require a specific role
 */
function require_role_api($role) {
    if (!isset($_SESSION['user'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    if ($role && $_SESSION['user']['role'] !== $role) {
        jsonResponse(['error' => 'Forbidden'], 403);
    }
}
