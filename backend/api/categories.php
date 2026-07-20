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
            $stmt = $pdo->query('SELECT * FROM categories ORDER BY id ASC');
            $categories = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $categories]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $name = trim($data['name'] ?? '');
            $price = floatval($data['price'] ?? 0);
            $price_type = (($data['price_type'] ?? '') === 'per_meter') ? 'per_meter' : 'fixed';

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Category name is required.']);
                exit();
            }

            $stmt = $pdo->prepare('INSERT INTO categories (name, price, price_type) VALUES (:name, :price, :price_type)');
            $stmt->execute([
                'name' => $name,
                'price' => $price,
                'price_type' => $price_type
            ]);

            echo json_encode(['success' => true, 'message' => 'Category created successfully.']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            $name = trim($data['name'] ?? '');
            $price = floatval($data['price'] ?? 0);
            $price_type = (($data['price_type'] ?? '') === 'per_meter') ? 'per_meter' : 'fixed';

            if (!$id || empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Category ID and name are required.']);
                exit();
            }

            $stmt = $pdo->prepare('UPDATE categories SET name = :name, price = :price, price_type = :price_type WHERE id = :id');
            $stmt->execute([
                'name' => $name,
                'price' => $price,
                'price_type' => $price_type,
                'id' => $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Category updated successfully.']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                $data = json_decode(file_get_contents('php://input'), true);
                $id = $data['id'] ?? null;
            }

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Category ID is required.']);
                exit();
            }

            $stmt = $pdo->prepare('DELETE FROM categories WHERE id = :id');
            $stmt->execute(['id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Category deleted successfully.']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}