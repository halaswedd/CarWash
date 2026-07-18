<?php
/**
 * Bootstrap: CORS headers + secure session start
 * Include this at the top of EVERY backend endpoint (before any output).
 */

// ---- CORS ----
$allowed_origin = 'http://localhost:3000';

header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ---- Secure session ----
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => 'localhost',
        'secure'   => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}