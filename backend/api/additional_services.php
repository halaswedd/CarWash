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
            // Fetching active services including name_ar
            $stmt = $pdo->query('SELECT id, name, name_ar, price, is_active FROM additional_services WHERE is_active = 1 ORDER BY id DESC');
            $services = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $services]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $name = trim($data['name'] ?? '');
            $name_ar = trim($data['name_ar'] ?? '');
            $price = floatval($data['price'] ?? 0);

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Service name is required.']);
                exit();
            }

            $stmt = $pdo->prepare('INSERT INTO additional_services (name, name_ar, price, is_active) VALUES (:name, :name_ar, :price, 1)');
            $stmt->execute([
                'name' => $name,
                'name_ar' => $name_ar,
                'price' => $price
            ]);

            echo json_encode(['success' => true, 'message' => 'Service created successfully.']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            $name = trim($data['name'] ?? '');
            $name_ar = trim($data['name_ar'] ?? '');
            $price = floatval($data['price'] ?? 0);

            if (!$id || empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Service ID and name are required.']);
                exit();
            }

            $stmt = $pdo->prepare('UPDATE additional_services SET name = :name, name_ar = :name_ar, price = :price, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
            $stmt->execute([
                'name' => $name,
                'name_ar' => $name_ar,
                'price' => $price,
                'id' => $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Service updated successfully.']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                $data = json_decode(file_get_contents('php://input'), true);
                $id = $data['id'] ?? null;
            }

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Service ID is required.']);
                exit();
            }

            // Hard Delete
            $stmt = $pdo->prepare('DELETE FROM additional_services WHERE id = :id');
            $stmt->execute(['id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Service deleted successfully.']);
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