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

$date = $_GET['date'] ?? date('Y-m-d'); // التاريخ الاقتصادي أو اليوم الحالي

try {
    // 1. جلب إجمالي المدخول (Total Revenue) وعدد إجمالي السيارات لليوم المحدد
    $stmtSummary = $pdo->prepare("
        SELECT 
            COALESCE(SUM(o.total), 0) AS total_revenue,
            COALESCE(SUM(oi.quantity), 0) AS total_cars
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE DATE(o.created_at) = :selected_date
    ");
    $stmtSummary->execute(['selected_date' => $date]);
    $summary = $stmtSummary->fetch(PDO::FETCH_ASSOC);

    // 2. جلب تفاصيل كميات السيارات لكل فئة (Category) في ذلك اليوم
    $stmtCategories = $pdo->prepare("
        SELECT 
            c.name AS category_name,
            SUM(oi.quantity) AS car_count,
            SUM(oi.quantity * oi.price) AS category_revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN categories c ON c.id = oi.category_id
        WHERE DATE(o.created_at) = :selected_date
        GROUP BY c.id, c.name
    ");
    $stmtCategories->execute(['selected_date' => $date]);
    $categoriesBreakdown = $stmtCategories->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'date' => $date,
        'total_revenue' => floatval($summary['total_revenue']),
        'total_cars' => intval($summary['total_cars']),
        'categories_breakdown' => $categoriesBreakdown
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}