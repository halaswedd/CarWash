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

$month = intval($_GET['month'] ?? date('m'));
$year = intval($_GET['year'] ?? date('Y'));

try {
    // 1. جلب إجمالي الإيرادات وعدد السيارات للشهر المحدد
    $stmtOrders = $pdo->prepare("
        SELECT 
            COALESCE(SUM(o.total), 0) AS total_revenue,
            COALESCE(SUM(oi.quantity), 0) AS total_cars
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE MONTH(o.created_at) = :month AND YEAR(o.created_at) = :year
    ");
    $stmtOrders->execute(['month' => $month, 'year' => $year]);
    $orderData = $stmtOrders->fetch(PDO::FETCH_ASSOC);

    // 2. جلب إجمالي المصروفات للشهر المحدد
    $stmtExpenses = $pdo->prepare("
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year
    ");
    $stmtExpenses->execute(['month' => $month, 'year' => $year]);
    $expenseData = $stmtExpenses->fetch(PDO::FETCH_ASSOC);

    $totalRevenue = floatval($orderData['total_revenue']);
    $totalCars = intval($orderData['total_cars']);
    $totalExpenses = floatval($expenseData['total_expenses']);
    
    // حساب صافي الربح (الإيرادات - المصروفات)
    $netProfit = $totalRevenue - $totalExpenses;

    echo json_encode([
        'success' => true,
        'month' => $month,
        'year' => $year,
        'total_cars' => $totalCars,
        'total_revenue' => $totalRevenue,
        'total_expenses' => $totalExpenses,
        'net_profit' => $netProfit
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}