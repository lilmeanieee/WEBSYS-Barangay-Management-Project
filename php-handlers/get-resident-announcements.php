<?php
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get the current resident ID from session
$resident_id = isset($_SESSION['resident_id']) ? $_SESSION['resident_id'] : null;

try {
    $pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $allAnnouncements = [];

    // Upcoming Events - no hidden functionality
    $stmt = $pdo->prepare("
        SELECT
            ue.upEvent_announcement_id AS id, 
            ue.upEvent_title AS title,
            ue.upEvent_details AS details,
            ue.event_date AS date,
            c.category_name AS category,
            '0' as hidden_for_resident
        FROM tbl_upcoming_event_announcement ue
        JOIN tbl_announcement_category c ON ue.category_id = c.category_id
        WHERE ue.status = 'active'
    ");
    $stmt->execute();
    $upcomingEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($upcomingEvents as &$event) {
        $event['type'] = 'Upcoming Event';
        $allAnnouncements[] = $event;
    }

    // News and Updates - no hidden functionality
    $stmt = $pdo->prepare("
        SELECT 
            n.news_update_announcement_id AS id,
            n.news_update_title AS title,
            n.news_update_details AS details,
            c.category_name AS category,
            '0' as hidden_for_resident
        FROM tbl_news_update_announcement n
        JOIN tbl_announcement_category c ON n.category_id = c.category_id
        WHERE n.status = 'active'
    ");
    $stmt->execute();
    $newsUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($newsUpdates as &$news) {
        $news['type'] = 'News and Update';
        $news['date'] = '';
        $allAnnouncements[] = $news;
    }

    // Volunteer Drives - with hidden functionality
    $stmt = $pdo->prepare("
        SELECT 
            v.volunteer_announcement_id AS id,
            v.volunteer_announcement_title AS title,
            v.details,
            v.date,
            v.exp_points,
            v.redeem_points,
            c.category_name AS category,
            CASE WHEN h.hidden_id IS NOT NULL THEN '1' ELSE '0' END as hidden_for_resident,
            CASE WHEN j.signup_id IS NOT NULL THEN '1' ELSE '0' END as resident_joined
        FROM tbl_volunteer_drive_announcement v
        JOIN tbl_announcement_category c ON v.category_id = c.category_id
        LEFT JOIN tbl_hidden_announcements h ON h.announcement_id = v.volunteer_announcement_id 
            AND h.announcement_type = 'Barangay Volunteer Drive' 
            AND h.resident_id = :resident_id
        LEFT JOIN tbl_volunteer_signups j ON j.volunteer_drive_id = v.volunteer_announcement_id 
            AND j.resident_id = :resident_id2
        WHERE v.status = 'active'
    ");
    $stmt->bindParam(':resident_id', $resident_id, PDO::PARAM_INT);
    $stmt->bindParam(':resident_id2', $resident_id, PDO::PARAM_INT);
    $stmt->execute();
    $volunteerDrives = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($volunteerDrives as &$drive) {
        $drive['type'] = 'Barangay Volunteer Drive';
        $allAnnouncements[] = $drive;
    }

    echo json_encode($allAnnouncements);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>