<?php
header('Content-Type: application/json');
ob_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    $pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => 'Invalid request method']);
        exit;
    }

    $residentId = $_POST['resident_id'] ?? null;
    $announcementId = $_POST['volunteer_announcement_id'] ?? null;
    $checkOnly = $_POST['check_only'] ?? 'false';

    // Debug logging
    error_log("Received data: resident_id=$residentId, volunteer_announcement_id=$announcementId, check_only=$checkOnly");

    if (!$residentId) {
        echo json_encode(['error' => 'Missing resident ID']);
        exit;
    }

    // Count how many times the resident joined this month
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) FROM tbl_volunteer_participation
        WHERE resident_id = :resident_id
        AND MONTH(joined_at) = MONTH(CURRENT_DATE())
        AND YEAR(joined_at) = YEAR(CURRENT_DATE())
    ");
    $checkStmt->execute(['resident_id' => $residentId]);
    $joinedThisMonth = $checkStmt->fetchColumn();

    // If we're just checking the count, return it now
    if ($checkOnly === 'true') {
        echo json_encode(['joined_this_month' => $joinedThisMonth]);
        exit;
    }

    // Otherwise, check if we have the announcement ID
    if (!$announcementId) {
        echo json_encode(['error' => 'Missing volunteer announcement ID']);
        exit;
    }
    
    // Debug: Check if the volunteer_announcement_id exists in the database
    $checkVolunteerStmt = $pdo->prepare("
        SELECT COUNT(*) FROM tbl_volunteer_drive_announcement 
        WHERE volunteer_announcement_id = :volunteer_announcement_id
    ");
    $checkVolunteerStmt->execute(['volunteer_announcement_id' => $announcementId]);
    $volunteerExists = $checkVolunteerStmt->fetchColumn();
    
    if ($volunteerExists == 0) {
        echo json_encode(['error' => 'Invalid volunteer announcement ID. This volunteer event does not exist.']);
        exit;
    }

    // Check if they've already joined this specific volunteer event
    $alreadyJoinedStmt = $pdo->prepare("
        SELECT COUNT(*) FROM tbl_volunteer_participation
        WHERE resident_id = :resident_id
        AND volunteer_announcement_id = :volunteer_announcement_id
    ");
    $alreadyJoinedStmt->execute([
        'resident_id' => $residentId,
        'volunteer_announcement_id' => $announcementId
    ]);
    $alreadyJoined = $alreadyJoinedStmt->fetchColumn();

    if ($alreadyJoined > 0) {
        echo json_encode(['error' => 'You have already joined this volunteer event.']);
        exit;
    }

    // Check if they've hit their monthly limit
    if ($joinedThisMonth >= 3) {
        echo json_encode(['error' => 'You have reached your 3 join limit for this month.']);
        exit;
    }

    // Insert participation
    try {
        $insertStmt = $pdo->prepare("
            INSERT INTO tbl_volunteer_participation (resident_id, volunteer_announcement_id, joined_at)
            VALUES (:resident_id, :volunteer_announcement_id, NOW())
        ");
        $insertStmt->execute([
            'resident_id' => $residentId,
            'volunteer_announcement_id' => $announcementId
        ]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Successfully joined the volunteer event.',
            'joined_this_month' => $joinedThisMonth + 1
        ]);
    } catch (PDOException $insertError) {
        // Specific error handling for the insert operation
        error_log("Insert error details: " . $insertError->getMessage());
        
        if ($insertError->getCode() == 23000) { // Integrity constraint violation
            // Check which constraint failed
            if (strpos($insertError->getMessage(), 'tbl_volunteer_participation_ibfk_1') !== false) {
                echo json_encode(['error' => 'Invalid resident ID. Please log in again.']);
            } else if (strpos($insertError->getMessage(), 'tbl_volunteer_participation_ibfk_2') !== false) {
                echo json_encode(['error' => 'Invalid volunteer announcement ID. This event may have been deleted.']);
            } else {
                echo json_encode(['error' => 'Database constraint error: ' . $insertError->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Database error when inserting participation: ' . $insertError->getMessage()]);
        }
        exit;
    }

} catch (PDOException $e) {
    error_log("General PDO error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}