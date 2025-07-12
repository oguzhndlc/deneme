<?php
// data.php
header("Content-Type: application/json");

echo json_encode([
    "status" => "success",
    "title" => "Merhaba Dünya!",
    "id" => 42
]);
?>
