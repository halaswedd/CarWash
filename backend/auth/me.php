<?php
/**
 * GET /backend/auth/me.php
 */

require_once __DIR__ . '/../bootstrap.php';

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit();
}

echo json_encode([
    'success' => true,
    'admin'   => [
        'id'    => $_SESSION['admin_id'],
        'email' => $_SESSION['admin_email'],
    ],
]);