<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
    if ($method === 'GET') {
        $month = intval($_GET['month'] ?? date('m'));
        $year = intval($_GET['year'] ?? date('Y'));

        // جلب المصروفات حسب الشهر والسنة المحددين
        $stmt = $pdo->prepare("
            SELECT * FROM expenses 
            WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year 
            ORDER BY id DESC
        ");
        $stmt->execute(['month' => $month, 'year' => $year]);
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // حساب إجمالي المصروفات للشهر المحدد
        $stmtTotal = $pdo->prepare("
            SELECT COALESCE(SUM(amount), 0) AS total_expenses 
            FROM expenses 
            WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year
        ");
        $stmtTotal->execute(['month' => $month, 'year' => $year]);
        $totalExpenses = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total_expenses'];

        echo json_encode([
            'success' => true,
            'data' => $expenses,
            'total_expenses' => floatval($totalExpenses)
        ]);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $title = trim($data['title'] ?? '');
        $amount = floatval($data['amount'] ?? 0);

        if (empty($title) || $amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please provide a valid title and amount.']);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO expenses (title, amount) VALUES (:title, :amount)");
        $stmt->execute(['title' => $title, 'amount' => $amount]);

        echo json_encode([
            'success' => true,
            'message' => 'Expense added successfully!',
            'id' => $pdo->lastInsertId()
        ]);
    } 
    elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid expense ID.']);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = :id");
        $stmt->execute(['id' => $id]);

        echo json_encode([
            'success' => true,
            'message' => 'Expense deleted successfully!'
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}