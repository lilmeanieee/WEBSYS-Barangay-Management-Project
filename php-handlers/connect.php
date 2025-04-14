<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "bms_database";

// Create connection
$conn = mysqli_connect($host, $user, $pass, $db);

$pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Check connection
if (!$conn) {
    die(json_encode(["error" => "Database connection failed: " . mysqli_connect_error()]));
}
    ?>

    