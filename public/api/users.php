<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'credentials.php';
require_once 'admin_auth.php';
$claims = require_admin_token();

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $stmt = $conn->prepare("SELECT id, username, email, role, created_at FROM users ORDER BY id DESC");
            $stmt->execute();
            $users = $stmt->fetchAll();
            
            echo json_encode($users ? $users : []);
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!is_array($data)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "A valid JSON request body is required."]);
                exit();
            }

            $id       = (isset($data['id']) && $data['id'] !== '' && $data['id'] !== null) ? (int)$data['id'] : null;
            $username = trim($data['username'] ?? '');
            $email    = trim($data['email'] ?? '');
            $role     = trim($data['role'] ?? 'admin');
            $rawPass  = $data['password'] ?? '';

            if ($username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($role, ['admin', 'staff'], true)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "A username, valid email, and supported role are required."]);
                exit();
            }

            // -----------------------------------------------------------------
            // 1. UPDATE EXISTING USER ($id is present)
            // -----------------------------------------------------------------
            if ($id !== null) {
                // Check if username is being taken by ANOTHER user account
                $checkStmt = $conn->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
                $checkStmt->execute([$username, $email, $id]);
                if ($checkStmt->fetch()) {
                    http_response_code(409);
                    echo json_encode(["success" => false, "message" => "That username or email is already in use."]);
                    exit();
                }

                // Execute UPDATE safely
                if ($rawPass !== '') {
                    $hashedPassword = password_hash($rawPass, PASSWORD_DEFAULT);
                    $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, role = ?, password = ? WHERE id = ?");
                    $stmt->execute([$username, $email, $role, $hashedPassword, $id]);
                } else {
                    $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?");
                    $stmt->execute([$username, $email, $role, $id]);
                }

                echo json_encode([
                    "success" => true, 
                    "message" => "User updated successfully",
                    "id"      => $id
                ]);
                exit();
            } 

            // -----------------------------------------------------------------
            // 2. CREATE NEW USER ($id is missing/null)
            // -----------------------------------------------------------------
            // Check if username already exists at all
            $checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $checkStmt->execute([$username, $email]);
            if ($checkStmt->fetch()) {
                http_response_code(409);
                echo json_encode(["success" => false, "message" => "That username or email is already in use."]);
                exit();
            }

            if (!is_string($rawPass) || $rawPass === '') {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Password is required for new users."]);
                exit();
            }

            $hashedPassword = password_hash($rawPass, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$username, $email, $hashedPassword, $role]);

            echo json_encode([
                "success" => true, 
                "message" => "User created successfully", 
                "id"      => $conn->lastInsertId()
            ]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"), true);
            $id = $data['id'] ?? $_GET['id'] ?? null;

            if (!is_numeric($id) || (int)$id < 1) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "A valid user ID is required."]);
                exit();
            }

            if ((int)$id === (int)$claims['sub']) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "You cannot delete the account currently signed in."]);
                exit();
            }

            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "User account not found."]);
                exit();
            }

            echo json_encode([
                "success" => true, 
                "message" => "User deleted successfully"
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                "success" => false, 
                "message" => "Method not allowed"
            ]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "User operation failed."
    ]);
}