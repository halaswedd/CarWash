<?php
/**
 * Require Auth Helper
 * Include this file at the top of any protected API endpoint.
 */

require_once __DIR__ . '/../bootstrap.php';

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'message' => 'Not authenticated. Please log in.'
    ]);
    exit();
}