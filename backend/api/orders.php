<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        $items = is_array($data['items']) ? $data['items'] : []; // الفئات بالسلّة
        $services = is_array($data['additional_services']) ? $data['additional_services'] : []; // الخدمات الإضافية بالسلّة
        $total_ll = floatval($data['total_amount'] ?? 0); // الإجمالي بالليرة القادم من الـ Front-end

        if (empty($items) && empty($services)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cart is empty.']);
            exit();
        }

        // تحويل الإجمالي الكلي للطلب إلى دولار (بالقسمة على 89,000) ليحفظ بالدولار في قاعدة البيانات
        $total_usd = $total_ll / 89000;

        $pdo->beginTransaction();

        // 1. Insert main order (تخزين الإجمالي بالدولار)
        $stmtOrder = $pdo->prepare('INSERT INTO orders (total) VALUES (:total)');
        $stmtOrder->execute(['total' => $total_usd]);
        $order_id = $pdo->lastInsertId();

        // 2. Insert cart items into order_items
        $stmtItem = $pdo->prepare('
            INSERT INTO order_items (order_id, category_id, quantity, price) 
            VALUES (:order_id, :category_id, :quantity, :price)
        ');

        foreach ($items as $item) {
            $cat_id = intval($item['id'] ?? 0);
            $qty = intval($item['quantity'] ?? 1);
            // إذا بدك الأسعار الداخلية للـ items تحفظ كمان بالدولار أو تضل مثل ما هي، فيك تخليها، لكن الأهم الـ total صار دولار
            $price = floatval($item['price'] ?? 0);

            if ($cat_id > 0 && $qty > 0) {
                $stmtItem->execute([
                    'order_id' => $order_id,
                    'category_id' => $cat_id,
                    'quantity' => $qty,
                    'price' => $price
                ]);
            }
        }

        // 3. Insert additional services (supporting quantities)
        if (!empty($services)) {
            $stmtService = $pdo->prepare('
                INSERT INTO order_additional_services (order_id, additional_service_id, price) 
                VALUES (:order_id, :additional_service_id, :price)
            ');

            foreach ($services as $serv) {
                $service_id = intval($serv['id'] ?? 0);
                $service_price = floatval($serv['price'] ?? 0);
                $qty = intval($serv['quantity'] ?? 1);

                for ($i = 0; $i < $qty; $i++) {
                    if ($service_id > 0) {
                        $stmtService->execute([
                            'order_id' => $order_id,
                            'additional_service_id' => $service_id,
                            'price' => $service_price
                        ]);
                    }
                }
            }
        }

        $pdo->commit();

        echo json_encode([
            'success' => true, 
            'message' => 'Order submitted successfully!', 
            'order_id' => $order_id
        ]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
}