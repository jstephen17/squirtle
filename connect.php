<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");

    // Database settings
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "autoWatering";

    // Connect to MySQL
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
        exit();
    }

    // Function to fetch the newest row from a table
    function fetchLatest($conn, $table) {
        $sql = "SELECT * FROM `$table` ORDER BY timedate_stamp DESC LIMIT 1";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            return $result->fetch_assoc();
        } else {
            return null;
        }
    }

    function fetchRecents($conn, $table, $limit = 1) {
        $limit = intval($limit); // sanitize
        $sql = "SELECT * FROM `$table` ORDER BY timedate_stamp DESC LIMIT $limit";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            return ($limit === 1) ? $result->fetch_assoc()
                                : $result->fetch_all(MYSQLI_ASSOC);
        } else {
            return null;
        }
    }

    // Fetch latest data from both tables
    $latestMoisture = fetchLatest($conn, "moisture");
    $latestWater = fetchLatest($conn, "water");

    // Send JSON to frontend
    echo json_encode([
        "moisture" => $latestMoisture,
        "water" => $latestWater
    ]);

    $conn->close();
?>
