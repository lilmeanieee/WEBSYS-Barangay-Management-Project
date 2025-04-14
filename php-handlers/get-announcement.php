<?php
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=localhost;dbname=bms_database', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $allAnnouncements = [];

    // Upcoming Events - Add WHERE status = 'active'
    $stmt = $pdo->query("
        SELECT
            ue.upEvent_announcement_id AS id, 
            ue.upEvent_title AS title,
            ue.upEvent_details AS details,
            ue.event_date AS date,
            ue.created_at AS date_posted,
            c.category_name
        FROM tbl_upcoming_event_announcement ue
        JOIN tbl_announcement_category c ON ue.category_id = c.category_id
        WHERE ue.status = 'active'
    ");
    $upcomingEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($upcomingEvents as &$event) {
        $event['type'] = 'Upcoming Event';
        $event['category'] = $event['category_name'];  
        unset($event['category_name']); 
        $allAnnouncements[] = $event;
    }

    // News and Updates - Add WHERE status = 'active'
    $stmt = $pdo->query("
        SELECT 
            n.news_update_announcement_id AS id,
            n.news_update_title AS title,
            n.news_update_details AS details,
            n.created_at ,
            c.category_name
        FROM tbl_news_update_announcement n
        JOIN tbl_announcement_category c ON n.category_id = c.category_id
        WHERE n.status = 'active'
    ");
    $newsUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($newsUpdates as &$news) {
        $news['type'] = 'News and Update';
        $news['date'] = '';
        $news['category'] = $news['category_name'];
        unset($news['category_name']);
        $allAnnouncements[] = $news;
    }

    // Volunteer Drives - Add WHERE status = 'active'
    $stmt = $pdo->query("   
        SELECT 
            v.volunteer_announcement_id AS id,
            v.volunteer_announcement_title AS title,
            v.details,
            v.date,
            v.created_at AS date_posted,
            v.experience_points  AS experience_points,      
            v.redeemable_points AS redeemable_points, 
            c.category_name
        FROM tbl_volunteer_drive_announcement v
        JOIN tbl_announcement_category c ON v.category_id = c.category_id
        WHERE v.status = 'active'
    ");
    $volunteerDrives = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($volunteerDrives as &$drive) {
        $drive['type'] = 'Barangay Volunteer Drive';
        $drive['category'] = $drive['category_name'];
        unset($drive['category_name']);
        $allAnnouncements[] = $drive;
    }

    echo json_encode($allAnnouncements);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>