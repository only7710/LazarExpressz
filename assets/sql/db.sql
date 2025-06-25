CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(255),
    train_name VARCHAR(255),
    headsign VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    speed INT,
    delay_seconds INT,
    stop_name VARCHAR(255),
    scheduled_time TIME,
    actual_time TIME,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
