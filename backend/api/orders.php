<?php
// Dynamic CORS Origin Handling
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Fetch orders along with category details
            $stmt = $pdo->query('
                SELECT o.*, c.name as category_name 
                FROM orders o
                LEFT JOIN categories c ON o.category_id = c.id
                ORDER BY o.id DESC
            ');
            $orders = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $orders]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            $category_id = intval($data['category_id'] ?? 0);
            $total = floatval($data['total_amount'] ?? $data['total'] ?? 0);
            $services = is_array($data['additional_services']) ? $data['additional_services'] : [];

            if (!$category_id || $total <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Please select a category and total amount.']);
                exit();
            }

            // Transaction to ensure atomic insert across both tables
            $pdo->beginTransaction();

            // 1. Insert into orders table
            $stmtOrder = $pdo->prepare('INSERT INTO orders (category_id, total) VALUES (:category_id, :total)');
            $stmtOrder->execute([
                'category_id' => $category_id,
                'total' => $total
            ]);

            $order_id = $pdo->lastInsertId();

            // 2. Insert into order_additional_services table
            if (!empty($services)) {
                $stmtService = $pdo->prepare('
                    INSERT INTO order_additional_services (order_id, additional_service_id, price) 
                    VALUES (:order_id, :additional_service_id, :price)
                ');

                foreach ($services as $serv) {
                    $service_id = intval($serv['id'] ?? 0);
                    $service_price = floatval($serv['price'] ?? 0);

                    if ($service_id > 0) {
                        $stmtService->execute([
                            'order_id' => $order_id,
                            'additional_service_id' => $service_id,
                            'price' => $service_price
                        ]);
                    }
                }
            }

            $pdo->commit();

            echo json_encode([
                'success' => true, 
                'message' => 'Order created successfully!', 
                'order_id' => $order_id
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
            break;
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}