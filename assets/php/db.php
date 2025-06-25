<?php

    $conn = new mysqli("localhost", "root", "", "lazarexpress");
    
    if($conn->connect_error){
       die("Sikertelen csatlakozás! Hibakód: ".$conn->connect_error);
    }

?>