<?php
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get JSON data from the request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Validate input data
if (!isset($data['announcement_id']) || !isset($data['announcement_type']) || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

$announcement_id = $data['announcement_id'];
$announcement_type = $data['announcement_type'];
$resident_id = $data['resident_id'];

// Verify that the resident ID in the request matches the session resident ID for security
if (!isset($_SESSION['resident_id']) || $_SESSION['resident_id'] != $resident_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Validate announcement type
$valid_types = ['Upcoming Event', 'News and Update', 'Barangay Volunteer Drive'];
if (!in_array($announcement_type, $valid_types)) {
    echo json_encode(['success' => false, 'message' => 'Invalid announcement type']);
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if the announcement is already hidden by this resident
    $stmt = $pdo->prepare("
        SELECT hidden_id 
        FROM tbl_hidden_announcements 
        WHERE announcement_id = ? AND announcement_type = ? AND resident_id = ?
    ");
    $stmt->execute([$announcement_id, $announcement_type, $resident_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Announcement was already hidden']);
        exit;
    }
    
    // Insert into hidden announcements table
    $stmt = $pdo->prepare("
        INSERT INTO tbl_hidden_announcements (announcement_id, announcement_type, resident_id, hidden_date) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$announcement_id, $announcement_type, $resident_id]);
    
    echo json_encode(['success' => true, 'message' => 'Announcement hidden successfully']);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to hide announcement: ' . $e->getMessage()]);
}
?>