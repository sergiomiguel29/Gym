<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

try{

    $mail->isSMTP();

    $mail->Host = 'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username = 'sergioseminario225@gmail.com';

    $mail->Password = 'AQUI_TU_CONTRASEÑA_DE_APLICACION';

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

    $mail->Port = 465;

    $mail->setFrom(
        'sergioseminario225@gmail.com',
        'GYM PRO'
    );

    $mail->addAddress(
        'sergioseminario225@gmail.com'
    );

    $mail->Subject = 'Prueba de correo';

    $mail->Body = 'Si recibes este correo, PHPMailer funciona correctamente.';

    $mail->send();

    echo "CORREO ENVIADO";

}
catch(Exception $e){

    echo "ERROR: " . $mail->ErrorInfo;

}