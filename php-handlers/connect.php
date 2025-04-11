<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "bms_database";

// Create connection
$conn = mysqli_connect($host, $user, $pass, $db);

// Check connection
if (!$conn) {
    die(json_encode(["error" => "Database connection failed: " . mysqli_connect_error()]));
}
    ?>

    