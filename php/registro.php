<?php
require_once __DIR__ . '/../conexion/conexion.php';
require_once 'enviar_correo.php';

$nombre = post_value('nombre');
$correo = post_value('correo');
$clave = $_POST['clave'] ?? '';

if ($nombre === '' || $correo === '' || $clave === '') {
    json_response(['ok' => false, 'message' => 'Complete todos los campos.'], 422);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    json_response(['ok' => false, 'message' => 'El correo no es valido.'], 422);
}

if (strlen($clave) < 6) {
    json_response(['ok' => false, 'message' => 'La contrasena debe tener al menos 6 caracteres.'], 422);
}

$verificar = $conn->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
$verificar->bind_param('s', $correo);
$verificar->execute();

if ($verificar->get_result()->num_rows > 0) {
    json_response(['ok' => false, 'message' => 'Este correo ya esta registrado.'], 409);
}

$codigo = (string) random_int(100000, 999999);
$claveHash = password_hash($clave, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    'INSERT INTO usuarios (nombre, correo, clave, codigo, verificado) VALUES (?, ?, ?, ?, 0)'
);
$stmt->bind_param('ssss', $nombre, $correo, $claveHash, $codigo);
$stmt->execute();

$correoEnviado = enviar_codigo_verificacion($correo, $codigo);

json_response([
    'ok' => true,
    'requiresVerification' => true,
    'message' => $correoEnviado
        ? 'Usuario registrado. Revisa tu correo e ingresa el codigo de verificacion.'
        : 'Usuario registrado, pero falta configurar Gmail SMTP para enviar el codigo.',
]);
