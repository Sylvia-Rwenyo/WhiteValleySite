<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'credentials.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    exit;
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';
    $stem_length = $_POST['stem_length'] ?? '';
    $description = $_POST['description'] ?? '';
    $image_url = '';

    // Handle File Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../public/uploads/';
        
        // Create uploads directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('flower_', true) . '.' . $fileExtension;
        $targetFilePath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
            $image_url = '/uploads/' . $fileName;
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
            exit;
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Please upload a valid image file."]);
        exit;
    }

    // Insert into MySQL
    $query = "INSERT INTO flowers (name, category, stem_length, description, image_url) VALUES (:name, :category, :stem_length, :description, :image_url)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':stem_length', $stem_length);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':image_url', $image_url);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Flower uploaded successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save to database."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>