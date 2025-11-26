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

    if ($conn->connect_error) {
        echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
        exit();
    }

    // Fetch the newest row
    function fetchLatest($conn, $table) {
        $sql = "SELECT * FROM `$table` ORDER BY timedate_stamp DESC LIMIT 1";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            return $result->fetch_assoc();
        } else {
            return null;
        }
    }

    // Fetch multiple rows
    function fetchRecents($conn, $table, $limit = 1) {
        $limit = intval($limit);  // sanitize integer
        if ($limit < 1) $limit = 1;

        $sql = "SELECT * FROM `$table` ORDER BY timedate_stamp DESC LIMIT $limit";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            return ($limit === 1)
                ? $result->fetch_assoc()
                : $result->fetch_all(MYSQLI_ASSOC);
        } else {
            return null;
        }
    }

    // How many recent rows to fetch
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 1;

    // Fetch data
    $latestMoisture = fetchLatest($conn, "moisture");
    $latestWater    = fetchLatest($conn, "water");

    $recentMoisture = fetchRecents($conn, "moisture", $limit);
    $recentWater    = fetchRecents($conn, "water", $limit);

    // JSON response
    echo json_encode([
        "latest" => [
            "moisture" => $latestMoisture,
            "water"    => $latestWater
        ],
        "recents" => [
            "moisture" => $recentMoisture,
            "water"    => $recentWater
        ]
    ]);

    $conn->close();
?>
