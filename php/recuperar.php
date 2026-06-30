<?php
require_once __DIR__ . '/../conexion/conexion.php';
require_once 'enviar_correo.php';

$correo = post_value('correo');
$configCorreo = require __DIR__ . '/config_correo.php';
$correoAdmin = $configCorreo['username'] ?? 'sergioseminario225@gmail.com';

if (strtolower($correo) === 'admin') {
    $correo = $correoAdmin;
}

if ($correo === '') {
    json_response(['ok' => false, 'message' => 'Ingresa tu correo electrónico.'], 422);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    json_response(['ok' => false, 'message' => 'El correo no es válido.'], 422);
}

$stmt = $conn->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
$stmt->bind_param('s', $correo);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

if (!$usuario) {
    if (strtolower($correo) !== strtolower($correoAdmin)) {
        json_response(['ok' => false, 'message' => 'No existe una cuenta registrada con ese correo.'], 404);
    }

    $nombreAdmin = 'Administrador';
    $claveTemporal = password_hash(bin2hex(random_bytes(12)), PASSWORD_DEFAULT);
    $codigoTemporal = '';
    $insertar = $conn->prepare(
        'INSERT INTO usuarios (nombre, correo, clave, codigo, verificado) VALUES (?, ?, ?, ?, 1)'
    );
    $insertar->bind_param('ssss', $nombreAdmin, $correo, $claveTemporal, $codigoTemporal);
    $insertar->execute();
}

$codigo = (string) random_int(100000, 999999);
$actualizar = $conn->prepare('UPDATE usuarios SET codigo = ? WHERE correo = ?');
$actualizar->bind_param('ss', $codigo, $correo);
$actualizar->execute();

$correoEnviado = enviar_codigo_recuperacion($correo, $codigo);

json_response([
    'ok' => true,
    'mailSent' => $correoEnviado,
    'message' => $correoEnviado
        ? 'Te enviamos un código para cambiar tu contraseña.'
        : 'Gmail aún no tiene una contraseña de aplicación válida. Código local para cambiar tu contraseña: ' . $codigo,
]);
