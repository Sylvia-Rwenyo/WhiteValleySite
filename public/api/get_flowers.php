<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'credentials.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $type = $_GET['type'] ?? null;
    $occasion = $_GET['occasion'] ?? null;

    $sql = "SELECT id, name, flower_type, occasion, stem_length, description, price, image_url FROM flowers WHERE 1=1";
    $params = [];

    if ($type) {
        $sql .= " AND flower_type = :type";
        $params[':type'] = $type;
    }

    if ($occasion) {
        $sql .= " AND occasion = :occasion";
        $params[':occasion'] = $occasion;
    }

    $sql .= " ORDER BY id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    
    $flowers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($flowers);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>