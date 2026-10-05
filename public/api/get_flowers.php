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

    $stmt = $conn->prepare("SELECT id, name, category, stem_length, description, price, image_url FROM flowers ORDER BY category ASC, id DESC");
    $stmt->execute();
    
    $flowers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group items by category
    $groupedFlowers = [];
    foreach ($flowers as $flower) {
        $category = $flower['category'] ?? 'Uncategorized';
        $groupedFlowers[$category][] = $flower;
    }

    echo json_encode($groupedFlowers);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>