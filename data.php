<?php
// data.php
header("Content-Type: application/json");

echo json_encode([
    "status" => "success",
    "message" => "Merhaba Dünya!",
    "number" => 42
]);
?>
