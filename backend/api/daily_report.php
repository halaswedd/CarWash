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

$date = $_GET['date'] ?? date('Y-m-d');

try {

    // =========================
    // Total Revenue
    // =========================
    $stmtRevenue = $pdo->prepare("
        SELECT
            COALESCE(SUM(total),0) AS total_revenue
        FROM orders
        WHERE DATE(created_at)=:selected_date
    ");

    $stmtRevenue->execute([
        'selected_date' => $date
    ]);

    $revenueData = $stmtRevenue->fetch(PDO::FETCH_ASSOC);

    // =========================
    // Total Cars
    // =========================
    $stmtCars = $pdo->prepare("
        SELECT
            COALESCE(SUM(oi.quantity),0) AS total_cars
        FROM orders o
        INNER JOIN order_items oi
            ON oi.order_id=o.id
        WHERE DATE(o.created_at)=:selected_date
    ");

    $stmtCars->execute([
        'selected_date' => $date
    ]);

    $carData = $stmtCars->fetch(PDO::FETCH_ASSOC);

    // =========================
    // Categories Breakdown
    // =========================
    $stmtCategories = $pdo->prepare("
        SELECT
            c.name AS category_name,
            SUM(oi.quantity) AS car_count,
            SUM(oi.quantity * oi.price) AS category_revenue
        FROM order_items oi
        INNER JOIN orders o
            ON o.id = oi.order_id
        INNER JOIN categories c
            ON c.id = oi.category_id
        WHERE DATE(o.created_at)=:selected_date
        GROUP BY c.id,c.name
        ORDER BY c.name
    ");

    $stmtCategories->execute([
        'selected_date' => $date
    ]);

    $categoriesBreakdown = $stmtCategories->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'date' => $date,
        'total_revenue' => (float)$revenueData['total_revenue'],
        'total_cars' => (int)$carData['total_cars'],
        'categories_breakdown' => $categoriesBreakdown
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}