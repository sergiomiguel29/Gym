<?php
require_once __DIR__ . '/../conexion/conexion.php';

$correo = post_value('correo');
$codigo = post_value('codigo');
$clave = $_POST['clave'] ?? '';
$configCorreo = require __DIR__ . '/config_correo.php';
$correoAdmin = $configCorreo['username'] ?? 'sergioseminario225@gmail.com';

if (strtolower($correo) === 'admin') {
    $correo = $correoAdmin;
}

if ($correo === '' || $codigo === '' || $clave === '') {
    json_response(['ok' => false, 'message' => 'Completa correo, código y nueva contraseña.'], 422);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    json_response(['ok' => false, 'message' => 'El correo no es válido.'], 422);
}

if (strlen($clave) < 6) {
    json_response(['ok' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres.'], 422);
}

$stmt = $conn->prepare('SELECT id FROM usuarios WHERE correo = ? AND codigo = ? LIMIT 1');
$stmt->bind_param('ss', $correo, $codigo);
$stmt->execute();

if ($stmt->get_result()->num_rows === 0) {
    json_response(['ok' => false, 'message' => 'Código incorrecto o vencido.'], 401);
}

$claveHash = password_hash($clave, PASSWORD_DEFAULT);
$codigoUsado = '';
$actualizar = $conn->prepare('UPDATE usuarios SET clave = ?, codigo = ?, verificado = 1 WHERE correo = ?');
$actualizar->bind_param('sss', $claveHash, $codigoUsado, $correo);
$actualizar->execute();

json_response([
    'ok' => true,
    'message' => 'Contraseña actualizada. Ya puedes iniciar sesión con admin o con tu correo.',
]);
