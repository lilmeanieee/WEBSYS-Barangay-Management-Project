<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);


function getOrInsertAnnouncementCategory($pdo, $category) {
    $stmt = $pdo->prepare("SELECT category_id FROM tbl_announcement_category WHERE category_name = ?");
    $stmt->execute([$category]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) return $result['category_id'];

    $stmt = $pdo->prepare("INSERT INTO tbl_announcement_category (category_name) VALUES (?)");
    $stmt->execute([$category]);
    return $pdo->lastInsertId();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $details = $_POST['details'] ?? '';
    $date = $_POST['date'] ?? '';
    $deadline = $_POST['deadline'] ?? '';
    $time_start = $_POST['time_start'] ?? '';
    $time_end = $_POST['time_end'] ?? '';
    $exp_points = $_POST['exp_points'] ?? 0;
    $redeem_points = $_POST['redeem_points'] ?? 0;
    $eligibility = $_POST['eligibility'] ?? '';
    $category = $_POST['announcementCategory'] ?? '';

    // Handle location
    $location = $_POST['volunteerLocationCategory'] === 'other'
        ? ($_POST['volunteerLocationInputOption'] ?? '')
        : ($_POST['volunteerLocationCategory'] ?? '');

    // Handle file upload
    $file = $_FILES['file'] ?? null;
    $fileName = '';
    $fileType = '';

    if ($file && $file['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../uploads/volunteer_drive/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = time() . '_' . basename($file['name']);
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            http_response_code(500);
            echo 'File upload failed.';
            exit;
        }

        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
    }

    try {
        $pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->beginTransaction();

        $categoryId = getOrInsertAnnouncementCategory($pdo, $category);

        $stmt = $pdo->prepare("INSERT INTO tbl_volunteer_drive_announcement (
            category_id, volunteer_announcement_title, details, date, application_deadline,
            time_start, time_end, location, eligible_volunteers, experience_points,
            redeemable_points, file_name, file_type, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $categoryId,
            $title,
            $details,
            $date,
            $deadline,
            $time_start,
            $time_end,
            $location,
            $eligibility,
            $exp_points,
            $redeem_points,
            $fileName,
            $fileType,
            'active'
        ]);

        $pdo->commit();
        echo 'Success';
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo 'Database error: ' . $e->getMessage();
    }
} else {
    http_response_code(405);
    echo 'Invalid request method';
}
