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

$today = date('Y-m-d');
$currentMonth = date('m');
$currentYear = date('Y');

try {
    // إحصائيات اليوم (عدد السيارات والإيرادات)
    $stmtToday = $pdo->prepare("
        SELECT 
            COALESCE(SUM(o.total), 0) AS revenue_today,
            COALESCE(SUM(oi.quantity), 0) AS cars_today
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE DATE(o.created_at) = :today
    ");
    $stmtToday->execute(['today' => $today]);
    $todayData = $stmtToday->fetch(PDO::FETCH_ASSOC);

    // إحصائيات الشهر الحالي (عدد السيارات والإيرادات)
    $stmtMonth = $pdo->prepare("
        SELECT 
            COALESCE(SUM(o.total), 0) AS revenue_month,
            COALESCE(SUM(oi.quantity), 0) AS cars_month
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE MONTH(o.created_at) = :month AND YEAR(o.created_at) = :year
    ");
    $stmtMonth->execute(['month' => $currentMonth, 'year' => $currentYear]);
    $monthData = $stmtMonth->fetch(PDO::FETCH_ASSOC);

    // مصروفات الشهر الحالي
    $stmtExpenses = $pdo->prepare("
        SELECT COALESCE(SUM(amount), 0) AS monthly_expenses
        FROM expenses
        WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year
    ");
    $stmtExpenses->execute(['month' => $currentMonth, 'year' => $currentYear]);
    $expenseData = $stmtExpenses->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'cars_today' => intval($todayData['cars_today']),
        'revenue_today' => floatval($todayData['revenue_today']),
        'cars_month' => intval($monthData['cars_month']),
        'revenue_month' => floatval($monthData['revenue_month']),
        'monthly_expenses' => floatval($expenseData['monthly_expenses'])
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}