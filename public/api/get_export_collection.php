<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'credentials.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch export collection items ordered by latest ID
    $stmt = $conn->prepare("SELECT id, name, flower_type, stem_length, description, price, image_url FROM export_collection ORDER BY id DESC");
    $stmt->execute();
    
    $exportItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return direct array for frontend consumption
    echo json_encode($exportItems);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>