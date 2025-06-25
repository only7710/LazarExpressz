<?php
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Csak POST kérés engedélyezett.']);
        exit;
    }

    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Hibás vagy hiányzó JSON.']);
        exit;
    }

    $required = [
        'vehicle_id', 'train_name', 'headsign', 'latitude', 'longitude',
        'speed', 'delay_seconds', 'stop_name', 'scheduled_time', 'actual_time'
    ];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Hiányzó mező: $field"]);
            exit;
        }
    }

    $stmt = $conn->prepare(
        'INSERT INTO trains (vehicle_id, train_name, headsign, latitude, longitude, speed, delay_seconds, stop_name, scheduled_time, actual_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Adatbázis hiba: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param(
        'sssssiisss',
        $data['vehicle_id'],
        $data['train_name'],
        $data['headsign'],
        $data['latitude'],
        $data['longitude'],
        $data['speed'],
        $data['delay_seconds'],
        $data['stop_name'],
        $data['scheduled_time'],
        $data['actual_time']
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Mentési hiba: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
