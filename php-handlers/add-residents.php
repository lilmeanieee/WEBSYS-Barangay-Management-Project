<?php
include 'connect.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET['action']) && $_GET['action'] == "addResident") {
    $data = json_decode(file_get_contents("php://input"), true);

    file_put_contents("debug_log.txt", print_r($data, true)); // Logs to a file instead of the console

    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input data"]);
        exit;
    }

    $confirm = isset($data["confirm"]) ? $data["confirm"] : false;

    $requiredFields = ["last_name", "first_name", "birthdate", "email_address", "mobile_no", "house_lot_no", "street", "barangay", "city_municipality", "province", "region", "emergency_name", "emergency_contact_num", "emergency_relationship"];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(["error" => ucfirst(str_replace("_", " ", $field)) . " is required."]);
            exit;
        }
    }

    try {
        $conn->begin_transaction();

        // Check if resident exists
        $stmt = $conn->prepare("SELECT resident_id FROM tbl_residents WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) AND birthdate = ?");
        $stmt->bind_param("sss", $data["first_name"], $data["last_name"], $data["birthdate"]);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0 && !$confirm) {
            http_response_code(200);
            echo json_encode(["warning" => "A resident with the same details already exists. Do you want to continue?"]);
            $conn->rollback();
            exit;
        }

        // Retrieve or Insert Address Components
        function getOrInsert($conn, $table, $column, $value) {
            $primaryKeys = [
                "tbl_house_lot_no" => "house_lot_id",
                "tbl_purok_subdivision" => "area_id",
                "tbl_street" => "street_id",
                "tbl_barangay" => "barangay_id",
                "tbl_city_municipality" => "city_id",
                "tbl_province" => "province_id",
                "tbl_region" => "region_id"
            ];

            // Check if the table exists in our mapping
            if (!isset($primaryKeys[$table])) {
                throw new Exception("Table '$table' not found in mapping.");
            }

            $primaryKey = $primaryKeys[$table];

            // Check if value exists
            $stmt = $conn->prepare("SELECT $primaryKey FROM $table WHERE $column = ?");
            $stmt->bind_param("s", $value);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row[$primaryKey];
            }

            // Insert new value if not found
            $stmt = $conn->prepare("INSERT INTO $table ($column) VALUES (?)");
            $stmt->bind_param("s", $value);
            $stmt->execute();
            return $conn->insert_id;
        }

        // Get or Insert Address Components
        $house_lot_id = getOrInsert($conn, "tbl_house_lot_no", "house_lot_name", $data["house_lot_no"]);
        $area_id = getOrInsert($conn, "tbl_purok_subdivision", "area_name", $data["purok"]);
        $street_id = getOrInsert($conn, "tbl_street", "street_name", $data["street"]);
        $barangay_id = getOrInsert($conn, "tbl_barangay", "barangay_name", $data["barangay"]);
        $city_id = getOrInsert($conn, "tbl_city_municipality", "city_name", $data["city_municipality"]);
        $province_id = getOrInsert($conn, "tbl_province", "province_name", $data["province"]);
        $region_id = getOrInsert($conn, "tbl_region", "region_number", $data["region"]);

        // Check if Address Exists
        $stmt = $conn->prepare("SELECT address_id FROM tbl_address WHERE house_lot_id = ? AND area_id = ? AND street_id = ? AND barangay_id = ? AND city_id = ? AND province_id = ? AND region_id = ?");
        $stmt->bind_param("iiiiiii", $house_lot_id, $area_id, $street_id, $barangay_id, $city_id, $province_id, $region_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $address_id = $row["address_id"];
        } else {
            $stmt = $conn->prepare("INSERT INTO tbl_address (house_lot_id, area_id, street_id, barangay_id, city_id, province_id, region_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiiiii", $house_lot_id, $area_id, $street_id, $barangay_id, $city_id, $province_id, $region_id);
            $stmt->execute();
            $address_id = $conn->insert_id;
        }

        // Generate Default Password
        $birthdate = date("mdy", strtotime($data["birthdate"]));
        $default_password = $data["last_name"] . "." . $birthdate;
        $hashed_password = password_hash($default_password, PASSWORD_BCRYPT);

        // Insert User Account
        $stmt = $conn->prepare("INSERT INTO tbl_users (email, password, role) VALUES (?, ?, 'Resident')");
        $stmt->bind_param("ss", $data["email_address"], $hashed_password);
        $stmt->execute();
        $user_id = $conn->insert_id;

        // Insert Emergency Contact
        $stmt = $conn->prepare("INSERT INTO tbl_emergency_contacts (name, contact_number, relationship) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $data["emergency_name"], $data["emergency_contact_num"], $data["emergency_relationship"]);
        $stmt->execute();
        $emergency_id = $conn->insert_id;  // Get the emergency_id of the newly inserted contact

        // Insert Resident with emergency_id
        $stmt = $conn->prepare("INSERT INTO tbl_residents 
        (user_id, last_name, first_name, middle_name, suffix, birthdate, age, gender, civil_status, religion, address_id, mobile_no, email_address, emergency_id, birthplace, age_months) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->bind_param("isssssissssssisi", 
        $user_id, 
        $data["last_name"], 
        $data["first_name"], 
        $data["middle_name"],  
        $data["suffix"],       
        $data["birthdate"], 
        $data["age"],         
        $data["gender"], 
        $data["civil_status"], 
        $data["religion"], 
        $address_id, 
        $data["mobile_no"], 
        $data["email_address"], 
        $emergency_id,
        $data["nationality"], 
        $data["age_months"]
        );

        $stmt->execute();
        $resident_id = $conn->insert_id; // Get the resident_id of the inserted record

        $conn->commit();
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Resident Successfully Added", "clearForm" => true]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
}
?>
