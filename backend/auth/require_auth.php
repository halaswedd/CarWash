<?php
/**
 * Include this at the top of any endpoint that requires login.
 */

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated. Please log in.']);
    exit();
}