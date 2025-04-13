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
if (!isset($data['volunteer_drive_id']) || !isset($data['resident_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

$volunteer_drive_id = $data['volunteer_drive_id'];
$resident_id = $data['resident_id'];

// Verify that the resident ID in the request matches the session resident ID for security
if (!isset($_SESSION['resident_id']) || $_SESSION['resident_id'] != $resident_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if the volunteer drive exists and is active
    $stmt = $pdo->prepare("
        SELECT volunteer_announcement_id, exp_points, redeem_points 
        FROM tbl_volunteer_drive_announcement 
        WHERE volunteer_announcement_id = ? AND status = 'active'
    ");
    $stmt->execute([$volunteer_drive_id]);
    $volunteerDrive = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$volunteerDrive) {
        echo json_encode(['success' => false, 'message' => 'Volunteer drive not found or inactive']);
        exit;
    }
    
    $exp_points = $volunteerDrive['exp_points'];
    $redeem_points = $volunteerDrive['redeem_points'];
    
    // Check if the resident has already joined this volunteer drive
    $stmt = $pdo->prepare("
        SELECT signup_id 
        FROM tbl_volunteer_signups 
        WHERE volunteer_drive_id = ? AND resident_id = ?
    ");
    $stmt->execute([$volunteer_drive_id, $resident_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'You have already joined this volunteer drive']);
        exit;
    }
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Insert the volunteer signup
    $stmt = $pdo->prepare("
        INSERT INTO tbl_volunteer_signups (volunteer_drive_id, resident_id, signup_date, status) 
        VALUES (?, ?, NOW(), 'pending')
    ");
    $stmt->execute([$volunteer_drive_id, $resident_id]);
    
    // Create a record in the points history table (points will be awarded when participation is confirmed)
    $stmt = $pdo->prepare("
        INSERT INTO tbl_points_history (resident_id, event_id, event_type, exp_points, redeem_points, status, date_earned) 
        VALUES (?, ?, 'volunteer_drive', ?, ?, 'pending', NOW())
    ");
    $stmt->execute([$resident_id, $volunteer_drive_id, $exp_points, $redeem_points]);
    
    // Commit transaction
    $pdo->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Successfully joined volunteer drive',
        'exp_points' => $exp_points,
        'redeem_points' => $redeem_points
    ]);
    
} catch (PDOException $e) {
    // Roll back transaction on error
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>