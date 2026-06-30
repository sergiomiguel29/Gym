<?php
require_once __DIR__ . '/../conexion/conexion.php';

$correo = post_value('correo');
$clave = $_POST['clave'] ?? '';
$configCorreo = require __DIR__ . '/config_correo.php';
$correoAdmin = $configCorreo['username'] ?? 'sergioseminario225@gmail.com';

if (strtolower($correo) === 'admin') {
    $correo = $correoAdmin;
}

if ($correo === '' || $clave === '') {
    json_response(['ok' => false, 'message' => 'Ingresa correo y contraseña.'], 422);
}

$stmt = $conn->prepare('SELECT id, nombre, correo, clave, verificado FROM usuarios WHERE correo = ? LIMIT 1');
$stmt->bind_param('s', $correo);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

if (!$usuario || !password_verify($clave, $usuario['clave'])) {
    json_response(['ok' => false, 'message' => 'Correo o contraseña incorrectos.'], 401);
}

if ((int) $usuario['verificado'] !== 1) {
    json_response(['ok' => false, 'message' => 'Tu cuenta aún no está verificada.'], 403);
}

json_response([
    'ok' => true,
    'message' => 'Login correcto.',
    'user' => [
        'id' => (int) $usuario['id'],
        'nombre' => $usuario['nombre'],
        'correo' => $usuario['correo'],
    ],
]);
