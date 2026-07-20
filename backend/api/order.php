<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query('
            SELECT 
                o.id,
                o.category_id,
                o.total,
                o.created_at,
                c.name AS category_name,
                GROUP_CONCAT(s.name SEPARATOR ", ") AS services_list
            FROM orders o
            LEFT JOIN categories c ON o.category_id = c.id
            LEFT JOIN order_additional_services oas ON o.id = oas.order_id
            LEFT JOIN additional_services s ON oas.additional_service_id = s.id
            GROUP BY o.id
            ORDER BY o.id DESC
        ');
        $orders = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $orders]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
}