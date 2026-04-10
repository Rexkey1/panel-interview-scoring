<?php
// api/config.php
return [
  'db' => [
    'host' => '127.0.0.1',
    'name' => 'panel_scoring',
    'user' => 'root',
    'pass' => '',
    'charset' => 'utf8mb4',
  ],
  'app' => [
    'session_name' => 'PANEL_SCORING_SESS',
    'cors_origin' => 'http://localhost:5173', // Vite dev server default
  ]
];
