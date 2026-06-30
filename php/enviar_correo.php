<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../PHPMailer/src/Exception.php';
require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/src/SMTP.php';

function enviar_codigo_verificacion(string $correoDestino, string $codigo): bool
{
    return enviar_codigo_email(
        $correoDestino,
        $codigo,
        'Codigo de verificacion - GYM PRO BI',
        'Verifica tu cuenta',
        'Usa este codigo para activar tu cuenta en GYM PRO BI:',
        'Tu codigo de verificacion GYM PRO BI es: '
    );
}

function enviar_codigo_recuperacion(string $correoDestino, string $codigo): bool
{
    return enviar_codigo_email(
        $correoDestino,
        $codigo,
        'Recuperacion de contrasena - GYM PRO BI',
        'Recupera tu contrasena',
        'Usa este codigo para crear una nueva contrasena en GYM PRO BI:',
        'Tu codigo de recuperacion GYM PRO BI es: '
    );
}

function enviar_codigo_email(
    string $correoDestino,
    string $codigo,
    string $asunto,
    string $titulo,
    string $mensaje,
    string $mensajePlano
): bool
{
    $config = require __DIR__ . '/config_correo.php';

    if (
        empty($config['username']) ||
        empty($config['password']) ||
        $config['username'] === 'TU_CORREO@gmail.com' ||
        $config['password'] === 'TU_CONTRASENA_DE_APLICACION' ||
        $config['password'] === 'PON_AQUI_TU_CONTRASENA_DE_APLICACION'
    ) {
        return false;
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['username'];
        $mail->Password = $config['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = (int) $config['port'];
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($config['username'], $config['from_name']);
        $mail->addAddress($correoDestino);

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = '
            <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
                <div style="max-width:520px;margin:auto;background:white;border-radius:14px;padding:28px;border:1px solid #e5e7eb;">
                    <h2 style="color:#14532d;margin-top:0;">' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</h2>
                    <p>' . htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8') . '</p>
                    <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#16a34a;background:#f1f5f9;border-radius:12px;padding:18px;text-align:center;">
                        ' . htmlspecialchars($codigo, ENT_QUOTES, 'UTF-8') . '
                    </div>
                    <p style="color:#64748b;margin-top:20px;">Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
                    <p style="color:#14532d;font-weight:700;">DEVIOZ - GYM PRO BI</p>
                </div>
            </div>
        ';
        $mail->AltBody = $mensajePlano . $codigo;

        return $mail->send();
    } catch (Exception $e) {
        return false;
    }
}
