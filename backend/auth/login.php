<?php
/**
 * POST /backend/auth/login.php
 * Body (JSON): { "email": "...", "password": "..." }
 */

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$email    = trim($data['email'] ?? '');
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit();
}

$stmt = $pdo->prepare('SELECT id, email, password FROM admins WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit();
}

session_regenerate_id(true);
$_SESSION['admin_id']    = $admin['id'];
$_SESSION['admin_email'] = $admin['email'];

echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'admin'   => [
        'id'    => $admin['id'],
        'email' => $admin['email'],
    ],
]);