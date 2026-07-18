<?php
/**
 * Database connection (PDO)
 * Car Wash Management System — Backend
 */

$host   = '127.0.0.1';
$dbname = 'car_wash_db';
$user   = 'root';
$pass   = '';        // default XAMPP MySQL password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // throw exceptions on errors
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // return rows as assoc arrays
    PDO::ATTR_EMULATE_PREPARES   => false,                   // use REAL prepared statements
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed.'
    ]));
}