<?php
session_start();
include '../php-handlers/connect.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: ../html/login.html");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $current_password = $_POST["current_password"];
    $new_password = $_POST["new_password"];
    $confirm_password = $_POST["confirm_password"];

    if ($new_password !== $confirm_password) {
        $_SESSION['error'] = "New passwords do not match.";
        header("Location: change-password.php");
        exit();
    }

    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT password FROM tbl_users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($current_hashed_password);
    $stmt->fetch();
    $stmt->close();

    if (!password_verify($current_password, $current_hashed_password)) {
        $_SESSION['error'] = "Current password is incorrect.";
        header("Location: change-password.php");
        exit();
    }

    $new_hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    $update = $conn->prepare("UPDATE tbl_users SET password = ?, first_login = 0 WHERE user_id = ?");
    $update->bind_param("si", $new_hashed_password, $user_id);

    if ($update->execute()) {
        $_SESSION['success'] = "Password updated successfully.";

        if ($_SESSION['role'] == "Admin" || $_SESSION['role'] == "Sub-Admin") {
            header("Location: ../html/admin/dashboard.html");
        } else {
            header("Location: ../html/home.html");
        }
        exit();
    } else {
        $_SESSION['error'] = "Failed to update password.";
        header("Location: change-password.php");
        exit();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Change Password</title>
</head>
<body>

    <h2>Change Your Password</h2>
    <form id="changePasswordForm" method="POST" action="">
        <label for="current_password">Current Password:</label>
        <input type="password" name="current_password" required><br><br>

        <label for="new_password">New Password:</label>
        <input type="password" name="new_password" required><br><br>

        <label for="confirm_password">Confirm Password:</label>
        <input type="password" name="confirm_password" required><br><br>

        <button type="submit">Change Password</button>
    </form>

    <?php
    if (isset($_SESSION['error'])) {
        echo "<p style='color:red'>" . $_SESSION['error'] . "</p>";
        unset($_SESSION['error']);
    }
    if (isset($_SESSION['success'])) {
        echo "<p style='color:green'>" . $_SESSION['success'] . "</p>";
        unset($_SESSION['success']);
    }
    ?>

    <script>
        document.getElementById("changePasswordForm").addEventListener("submit", function (e) {
            const newPw = document.querySelector("[name='new_password']").value;
            const confirmPw = document.querySelector("[name='confirm_password']").value;

            if (newPw !== confirmPw) {
                e.preventDefault();
                alert("New passwords do not match!");
            }
        });
    </script>
</body>
</html>