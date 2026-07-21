<?php
/**
 * Script la-khalq aw tahdeeth l-Admin account
 */
require_once __DIR__ . '/config/db.php';

// ✏️ Put the email and password you want here:
$email    = 'admin@carwash.com';
$password = 'reslen12'; 

// Encrypt the password using PHP password_hash
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    // Distinct parameter names la-ma yirmi PDO Error
    $stmt = $pdo->prepare('
        INSERT INTO admins (email, password) 
        VALUES (:email, :password)
        ON DUPLICATE KEY UPDATE password = :password_dup
    ');
    
    $stmt->execute([
        'email'        => $email,
        'password'     => $hashedPassword,
        'password_dup' => $hashedPassword
    ]);

    echo "<h1 style='color: green;'>✅ Admin Created / Updated Successfully!</h1>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";

} catch (PDOException $e) {
    echo "<h1 style='color: red;'>❌ Error:</h1> " . $e->getMessage();
}