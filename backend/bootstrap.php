<?php
/**
 * Bootstrap: CORS headers + secure session start
 * Include this at the top of EVERY backend endpoint.
 */

// ---- Dynamic CORS for Localhost (Supports any port: 5173, 5174, 3000, etc.) ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (!empty($origin) && preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// ---- Handle Preflight OPTIONS Request ----
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ---- Secure Session Start ----
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => false, // Set to true if using HTTPS in production
        'httponly' => true,  // Prevents JS cookie access (XSS security)
        'samesite' => 'Lax',
    ]);
    session_start();
}