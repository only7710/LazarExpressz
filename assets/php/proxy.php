<?php

    header("Content-Type: application/json");

    $input = file_get_contents("php://input");
    if (!$input) {
        http_response_code(400);
        echo json_encode(["error" => "No input received"]);
        exit;
    }

    $ch = curl_init("https://emma.mav.hu/otp2-backend/otp/routers/default/index/graphql");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "User-Agent: Mozilla/5.0",
        "Content-Type: application/json",
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    http_response_code($http_code);
    echo $response;

    $responseData = json_decode($response, true);

    // Ha van vehiclePositions a válaszban, akkor logold MySQL-be
    if (isset($responseData['data']['vehiclePositions'])) {
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=mav", "user", "pass");

            foreach ($responseData['data']['vehiclePositions'] as $v) {
                $stmt = $pdo->prepare("INSERT INTO positions (vehicle_id, lat, lon, speed, timestamp)
                                    VALUES (?, ?, ?, ?, NOW())");
                $stmt->execute([
                    $v['vehicleId'],
                    $v['lat'],
                    $v['lon'],
                    $v['speed']
                ]);
            }
        } catch (PDOException $e) {
            error_log("DB error: " . $e->getMessage());
        }
    }


?>