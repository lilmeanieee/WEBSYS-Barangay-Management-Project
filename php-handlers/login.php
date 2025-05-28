<?php
include 'connect.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
        exit;
    }

    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Step 1: Find user by email
    $stmt = $conn->prepare("SELECT * FROM tbl_users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Account not found']);
        exit;
    }

    $user = $result->fetch_assoc();

    // Step 2: Verify password
    if (!password_verify($password, $user['password'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid password']);
        exit;
    }
    error_log("Entered: [$password]");
error_log("Stored : [" . $user['password'] . "]");

    // Step 3: Get linked resident (if any)
    $residentStmt = $conn->prepare("SELECT * FROM tbl_household_members WHERE user_id = ?");
    $residentStmt->bind_param("i", $user['user_id']);
    $residentStmt->execute();
    $residentResult = $residentStmt->get_result();

    if ($residentResult->num_rows === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Resident profile not found']);
        exit;
    }

    $resident = $residentResult->fetch_assoc();

    // Step 4: Combine info
    $userData = [
        'user_id' => $user['user_id'],
        'resident_id' => $resident['resident_id'], // ✅ this is what you need!
        'resident_code' => $resident['resident_code'],
        'first_name' => $resident['first_name'],
        'middle_name' => $resident['middle_name'],
        'last_name' => $resident['last_name'],
        'role' => $user['role'],
        'first_login' => $user['first_login'],
        'name' => $resident['last_name'] . ', ' . $resident['first_name'] . ' ' . $resident['middle_name']
    ];

    echo json_encode([
        'status' => 'success',
        'user' => $userData
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Login error: ' . $e->getMessage()]);
}
?>
