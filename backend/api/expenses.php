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
        $month = intval($_GET['month'] ?? date('n'));
        $year = intval($_GET['year'] ?? date('Y'));

        $stmt = $pdo->prepare("
            SELECT * FROM expenses 
            WHERE expense_month = :month AND expense_year = :year 
            ORDER BY id DESC
        ");
        $stmt->execute(['month' => $month, 'year' => $year]);
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtTotal = $pdo->prepare("
            SELECT COALESCE(SUM(COALESCE(amount_usd, amount)), 0) AS total_expenses 
            FROM expenses 
            WHERE expense_month = :month AND expense_year = :year
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
        
        // دعم استقبال name أو title لضمان عدم حدوث مشاكل
        $name = trim($data['name'] ?? $data['title'] ?? '');
        $amount = floatval($data['amount'] ?? 0);
        $currency = $data['currency'] ?? 'USD';

        if (empty($name) || $amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please provide a valid name and amount.']);
            exit();
        }

        // تحويل المبلغ إلى الدولار إذا كان بالليرة
        if ($currency === 'L.L') {
            $amount_usd = $amount / 89000;
        } else {
            $amount_usd = $amount;
        }

        $expense_month = intval(date('n'));
        $expense_year = intval(date('Y'));

        // الإدخال في عمود name المطابق لقاعدة البيانات
        $stmt = $pdo->prepare("
            INSERT INTO expenses (name, amount, currency, amount_usd, expense_month, expense_year) 
            VALUES (:name, :amount, :currency, :amount_usd, :expense_month, :expense_year)
        ");
        $stmt->execute([
            'name' => $name,
            'amount' => $amount,
            'currency' => $currency,
            'amount_usd' => $amount_usd,
            'expense_month' => $expense_month,
            'expense_year' => $expense_year
        ]);

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

        // تصحيح علامة = المفقودة في الاستعلام
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