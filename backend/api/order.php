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
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access.'
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    try {

        $stmt = $pdo->query("
            SELECT
                o.id,
                o.total,
                o.created_at,

                GROUP_CONCAT(
                    DISTINCT CONCAT(c.name, ' x', oi.quantity)
                    SEPARATOR ', '
                ) AS categories,

                GROUP_CONCAT(
                    DISTINCT s.name
                    SEPARATOR ', '
                ) AS services

            FROM orders o

            LEFT JOIN order_items oi
                ON oi.order_id = o.id

            LEFT JOIN categories c
                ON c.id = oi.category_id

            LEFT JOIN order_additional_services oas
                ON oas.order_id = o.id

            LEFT JOIN additional_services s
                ON s.id = oas.additional_service_id

            GROUP BY
                o.id,
                o.total,
                o.created_at

            ORDER BY o.id DESC
        ");

        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $orders
        ]);

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }

} else {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed'
    ]);
}