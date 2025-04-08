<?php
session_start();
include 'connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    if (empty($email) || empty($password)) {
        $_SESSION['error'] = "Both fields are required.";
        header("Location: ../html/login.html");
        exit();
    }

    $stmt = $conn->prepare("SELECT user_id, password, role, first_login FROM tbl_users WHERE email = ? AND status = 'Active'");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($user_id, $hashed_password, $role, $first_login);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            $_SESSION['user_id'] = $user_id;
            $_SESSION['role'] = $role;

            if ($first_login == 1 && ($role == "Admin" || $role == "Sub-Admin" || $role == "Resident")) {
                header("Location: ../html/change-password.php");
            } else if ($first_login == 0 && $role == "Resident") {
                header("Location: ../html/home.html");
            } else if ($first_login == 0 && ($role == "Admin" || $role == "Sub-Admin")) {
                header("Location: ../html/admin/dashboard.html");
            } else {
                $_SESSION['error'] = "Invalid role.";
                header("Location: ../html/login.html");
            }
            exit();
        }
    }

    $_SESSION['error'] = "Invalid credentials or inactive account.";
    header("Location: ../html/login.html");
    exit();
}
?>
