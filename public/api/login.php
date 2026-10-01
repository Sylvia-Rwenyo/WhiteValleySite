<?php
// login.php

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'credentials.php';
require_once 'admin_auth.php';

$data = json_decode(file_get_contents("php://input"), true);
$input_user = trim(is_array($data) ? ($data['username'] ?? '') : ($_POST['username'] ?? ''));
$input_pass = is_array($data) ? ($data['password'] ?? '') : ($_POST['password'] ?? '');

if ($input_user === '' || $input_pass === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit();
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE TRIM(username) = ? LIMIT 1");
    $stmt->execute([$input_user]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($input_pass, $user['password'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid username or password."]);
        exit();
    }

    echo json_encode([
        "success" => true,
        "token" => create_admin_token($user),
        "user" => ["id" => (int)$user['id'], "username" => $user['username'], "role" => $user['role']]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Database connection error: " . $e->getMessage()
    ]);
}