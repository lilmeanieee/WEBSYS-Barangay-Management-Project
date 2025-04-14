<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Step 1: Find the user
$stmt = $pdo->prepare("SELECT * FROM tbl_users WHERE email = ? AND status = 'Active'");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    $userId = $user['user_id'];
    $role = $user['role'];
    $firstLogin = $user['first_login'];

    // Get name and points from tbl_residents
    $stmt = $pdo->prepare("SELECT resident_id, first_name, middle_name, last_name, experience_points, redeemable_points FROM tbl_residents WHERE user_id = ?");
    $stmt->execute([$userId]);
    $resident = $stmt->fetch(PDO::FETCH_ASSOC);

    $fullName = trim(($resident['first_name'] ?? '') . ' ' . ($resident['middle_name'] ?? '') . ' ' . ($resident['last_name'] ?? ''));
    $xp = $resident['experience_points'] ?? 0;
    $points = $resident['redeemable_points'] ?? 0;
    $residentId = $resident['resident_id'] ?? null;

    $userData = [
        'resident_id' => $residentId,
        'name' => $fullName,
        'xp' => $xp,
        'points' => $points,
        'role' => $role
    ];

    // Store session values
    $_SESSION['user_id'] = $userId;
    $_SESSION['role'] = $role;
    $_SESSION['name'] = $fullName;
    $_SESSION['xp'] = $xp;
    $_SESSION['points'] = $points;

    // First login → redirect to change password (but still send user data)
    if ($firstLogin == 1) {
        echo json_encode([
            'redirect' => '../html/change_pass.html',
            'user' => $userData
        ]);
        exit;
    }

    // Normal login → send role-based redirect
    $redirect = ($role === 'Resident')
        ? '../html/home.html'
        : '../html/admin/dashboard.html';

    echo json_encode([
        'status' => 'success',
        'user' => $userData,
        'redirect' => $redirect
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
}
