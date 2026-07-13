<?php
require_once __DIR__ . '/../conexion/conexion.php';

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

if ($accion === 'guardar') {
    $nombre = post_value('nombre');
    $correo = post_value('correo');
    $telefono = post_value('telefono');

    if ($nombre === '' || $correo === '') {
        json_response(['ok' => false, 'message' => 'Faltan datos para guardar el cliente.'], 422);
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'message' => 'El correo no es válido.'], 422);
    }

    $stmt = $conn->prepare('INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $nombre, $correo, $telefono);
    $stmt->execute();

    json_response(['ok' => true, 'message' => 'Cliente guardado correctamente.']);
}

if ($accion === 'listar') {
    $result = $conn->query(
        'SELECT
            c.id,
            c.nombre,
            c.correo,
            c.telefono,
            COUNT(m.id) AS total_mediciones,
            MAX(m.fecha) AS ultima_medicion
         FROM clientes c
         LEFT JOIN mediciones m ON m.cliente_id = c.id
         GROUP BY c.id, c.nombre, c.correo, c.telefono
         ORDER BY c.id DESC'
    );
    $clientes = [];

    while ($row = $result->fetch_assoc()) {
        $clientes[] = [
            'id' => (int) $row['id'],
            'nombre' => $row['nombre'],
            'correo' => $row['correo'],
            'telefono' => $row['telefono'],
            'total_mediciones' => (int) $row['total_mediciones'],
            'ultima_medicion' => $row['ultima_medicion'],
        ];
    }

    json_response(['ok' => true, 'data' => $clientes]);
}

if ($accion === 'editar') {
    $id = (int) ($_POST['id'] ?? 0);
    $nombre = post_value('nombre');
    $correo = post_value('correo');
    $telefono = post_value('telefono');

    if ($id <= 0 || $nombre === '' || $correo === '') {
        json_response(['ok' => false, 'message' => 'Datos inválidos para actualizar.'], 422);
    }

    $stmt = $conn->prepare('UPDATE clientes SET nombre = ?, correo = ?, telefono = ? WHERE id = ?');
    $stmt->bind_param('sssi', $nombre, $correo, $telefono, $id);
    $stmt->execute();

    json_response(['ok' => true, 'message' => 'Cliente actualizado correctamente.']);
}

if ($accion === 'eliminar') {
    $id = (int) ($_POST['id'] ?? 0);

    if ($id <= 0) {
        json_response(['ok' => false, 'message' => 'ID inválido.'], 422);
    }

    $stmt = $conn->prepare('DELETE FROM clientes WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();

    json_response(['ok' => true, 'message' => 'Cliente eliminado correctamente.']);
}

json_response(['ok' => false, 'message' => 'Acción no válida.'], 400);
