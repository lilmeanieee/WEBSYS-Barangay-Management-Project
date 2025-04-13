<?php
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['volunteer_announcement_id'];
    $title = $_POST['title'];
    $details = $_POST['details'];
    $locationCategory = $_POST['volunteerLocationCategory'];
    $locationInput = $_POST['volunteerLocationInputOption'];
    $date = $_POST['date'];
    $deadline = $_POST['deadline'];
    $timeStart = $_POST['time_start'];
    $timeEnd = $_POST['time_end'];
    $expPoints = $_POST['exp_points'];
    $redeemPoints = $_POST['redeem_points'];
    $updatedAt = date('Y-m-d H:i:s');

    // Handle eligibility input
    $eligibility = $_POST['eligibility']; // This should be a string of selected options including "Other" if provided

    // Handle file upload if a new file is provided
    $fileName = null;
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $destination = '../../uploads/' . $fileName;

        if (!move_uploaded_file($fileTmpPath, $destination)) {
            die('File upload failed.');
        }
    }

    $sql = "UPDATE tbl_volunteer_drive_announcement 
            SET title = ?, details = ?, eligible_volunteer = ?, 
                volunteerLocationCategory = ?, volunteerLocationInputOption = ?, 
                date = ?, deadline = ?, time_start = ?, time_end = ?, 
                exp_points = ?, redeem_points = ?, updated_at = ?";

    $params = [$title, $details, $eligibility, $locationCategory, $locationInput, $date, $deadline, $timeStart, $timeEnd, $expPoints, $redeemPoints, $updatedAt];

    if ($fileName) {
        $sql .= ", file = ?";
        $params[] = $fileName;
    }

    $sql .= " WHERE volunteer_announcement_id = ?";
    $params[] = $id;

    $stmt = $pdo->prepare($sql);
    if ($stmt->execute($params)) {
        echo "success";
    } else {
        echo "error";
    }
}
?>
