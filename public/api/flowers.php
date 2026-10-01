<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'credentials.php';
require_once 'admin_auth.php';
require_admin_token();

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT id, name, category, stem_length, description, price, image_url FROM flowers WHERE id = ?");
            $stmt->execute([(int)$_GET['id']]);
            echo json_encode(["success" => true, "data" => $stmt->fetch()]);
        } else {
            $stmt = $conn->query("SELECT id, name, category, stem_length, description, price, image_url FROM flowers ORDER BY id DESC");
            echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        }
        exit();
    }

    if ($method === 'POST') {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'multipart/form-data') !== false) {
            $data = $_POST;
        } else {
            $data = json_decode(file_get_contents("php://input"), true);
            $data = is_array($data) ? $data : [];
        }

        $id = isset($data['id']) && $data['id'] !== '' ? (int)$data['id'] : null;
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $stemLength = trim($data['stem_length'] ?? '');
        $description = trim($data['description'] ?? '');
        $price = $data['price'] ?? null;

        if ($name === '' || $category === '' || !is_numeric($price) || (float)$price < 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Name, category, and a valid non-negative price are required."]);
            exit();
        }

        $existingImage = '';
        if ($id !== null) {
            $lookup = $conn->prepare("SELECT image_url FROM flowers WHERE id = ?");
            $lookup->execute([$id]);
            $existing = $lookup->fetch();
            if (!$existing) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Flower not found."]);
                exit();
            }
            $existingImage = $existing['image_url'] ?? '';
        }

        $imageUrl = trim($data['image_url'] ?? $existingImage);
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            $file = $_FILES['image'];
            if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 5 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Image upload failed or exceeds the 5 MB limit."]);
                exit();
            }

            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
            $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
            if (!isset($extensions[$mime])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Upload a JPEG, PNG, WEBP, or GIF image."]);
                exit();
            }

            $uploadDir = __DIR__ . '/../uploads';
            if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
                throw new RuntimeException("Unable to create image upload directory.");
            }
            $fileName = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
            $uploadedPath = $uploadDir . '/' . $fileName;
            if (!move_uploaded_file($file['tmp_name'], $uploadedPath)) {
                throw new RuntimeException("Unable to store uploaded image.");
            }
            $imageUrl = '/uploads/' . $fileName;
        }

        if ($imageUrl === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "An image is required."]);
            exit();
        }

        if ($id === null) {
            $stmt = $conn->prepare("INSERT INTO flowers (name, category, stem_length, description, price, image_url) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $category, $stemLength, $description, $price, $imageUrl]);
            $id = (int)$conn->lastInsertId();
        } else {
            $stmt = $conn->prepare("UPDATE flowers SET name = ?, category = ?, stem_length = ?, description = ?, price = ?, image_url = ? WHERE id = ?");
            $stmt->execute([$name, $category, $stemLength, $description, $price, $imageUrl, $id]);
        }

        echo json_encode(["success" => true, "status" => "success", "message" => "Flower saved successfully.", "id" => $id]);
        exit();
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
        if ($id < 1) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "A valid flower ID is required."]);
            exit();
        }
        $stmt = $conn->prepare("DELETE FROM flowers WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Flower not found."]);
            exit();
        }
        echo json_encode(["success" => true, "message" => "Flower deleted successfully."]);
        exit();
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Flower operation failed."]);
}