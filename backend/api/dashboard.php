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

$today = date('Y-m-d');
$currentMonth = date('m');
$currentYear = date('Y');

try {

    // ==========================
    // TODAY REVENUE
    // ==========================
    $stmtTodayRevenue = $pdo->prepare("
        SELECT COALESCE(SUM(total),0) AS revenue_today
        FROM orders
        WHERE DATE(created_at)=:today
    ");

    $stmtTodayRevenue->execute([
        'today' => $today
    ]);

    $todayRevenue = $stmtTodayRevenue->fetch(PDO::FETCH_ASSOC);


    // ==========================
    // TODAY CARS
    // ==========================
    $stmtTodayCars = $pdo->prepare("
        SELECT COALESCE(SUM(oi.quantity),0) AS cars_today
        FROM orders o
        INNER JOIN order_items oi
            ON oi.order_id=o.id
        WHERE DATE(o.created_at)=:today
    ");

    $stmtTodayCars->execute([
        'today' => $today
    ]);

    $todayCars = $stmtTodayCars->fetch(PDO::FETCH_ASSOC);


    // ==========================
    // MONTH REVENUE
    // ==========================
    $stmtMonthRevenue = $pdo->prepare("
        SELECT COALESCE(SUM(total),0) AS revenue_month
        FROM orders
        WHERE MONTH(created_at)=:month
          AND YEAR(created_at)=:year
    ");

    $stmtMonthRevenue->execute([
        'month' => $currentMonth,
        'year' => $currentYear
    ]);

    $monthRevenue = $stmtMonthRevenue->fetch(PDO::FETCH_ASSOC);


    // ==========================
    // MONTH CARS
    // ==========================
    $stmtMonthCars = $pdo->prepare("
        SELECT COALESCE(SUM(oi.quantity),0) AS cars_month
        FROM orders o
        INNER JOIN order_items oi
            ON oi.order_id=o.id
        WHERE MONTH(o.created_at)=:month
          AND YEAR(o.created_at)=:year
    ");

    $stmtMonthCars->execute([
        'month' => $currentMonth,
        'year' => $currentYear
    ]);

    $monthCars = $stmtMonthCars->fetch(PDO::FETCH_ASSOC);


    // ==========================
    // MONTH EXPENSES
    // ==========================
    $stmtExpenses = $pdo->prepare("
        SELECT COALESCE(SUM(amount),0) AS monthly_expenses
        FROM expenses
        WHERE MONTH(created_at)=:month
          AND YEAR(created_at)=:year
    ");

    $stmtExpenses->execute([
        'month' => $currentMonth,
        'year' => $currentYear
    ]);

    $expenseData = $stmtExpenses->fetch(PDO::FETCH_ASSOC);


    echo json_encode([
        'success' => true,

        'cars_today' => (int)$todayCars['cars_today'],
        'revenue_today' => (float)$todayRevenue['revenue_today'],

        'cars_month' => (int)$monthCars['cars_month'],
        'revenue_month' => (float)$monthRevenue['revenue_month'],

        'monthly_expenses' => (float)$expenseData['monthly_expenses']
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}