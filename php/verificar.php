<?php
require_once __DIR__ . '/../conexion/conexion.php';

$correo = post_value('correo');
$codigo = post_value('codigo');

if ($correo === '' || $codigo === '') {
    json_response(['ok' => false, 'message' => 'Ingresa correo y codigo.'], 422);
}

$stmt = $conn->prepare('SELECT id FROM usuarios WHERE correo = ? AND codigo = ? LIMIT 1');
$stmt->bind_param('ss', $correo, $codigo);
$stmt->execute();

if ($stmt->get_result()->num_rows === 0) {
    json_response(['ok' => false, 'message' => 'Codigo incorrecto.'], 401);
}

$actualizar = $conn->prepare('UPDATE usuarios SET verificado = 1 WHERE correo = ?');
$actualizar->bind_param('s', $correo);
$actualizar->execute();

json_response(['ok' => true, 'message' => 'Cuenta verificada. Ya puedes iniciar sesion.']);
