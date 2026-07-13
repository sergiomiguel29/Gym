<?php
require_once __DIR__ . '/../conexion/conexion.php';

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

function decimal_or_null(string $key): ?float
{
    $value = trim($_POST[$key] ?? '');
    return $value === '' ? null : (float) $value;
}

if ($accion === 'guardar') {
    $clienteId = (int) ($_POST['cliente_id'] ?? 0);
    $fecha = post_value('fecha') ?: date('Y-m-d');
    $peso = decimal_or_null('peso');
    $cintura = decimal_or_null('cintura');
    $pecho = decimal_or_null('pecho');
    $brazo = decimal_or_null('brazo');
    $pierna = decimal_or_null('pierna');
    $grasa = decimal_or_null('grasa');
    $notas = post_value('notas');

    if ($clienteId <= 0) {
        json_response(['ok' => false, 'message' => 'Cliente inválido.'], 422);
    }

    $stmt = $conn->prepare(
        'INSERT INTO mediciones (cliente_id, fecha, peso, cintura, pecho, brazo, pierna, grasa, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('isdddddds', $clienteId, $fecha, $peso, $cintura, $pecho, $brazo, $pierna, $grasa, $notas);
    $stmt->execute();

    json_response(['ok' => true, 'message' => 'Medición registrada correctamente.']);
}

if ($accion === 'listar') {
    $clienteId = (int) ($_GET['cliente_id'] ?? 0);

    if ($clienteId <= 0) {
        json_response(['ok' => false, 'message' => 'Cliente inválido.'], 422);
    }

    $stmt = $conn->prepare(
        'SELECT id, cliente_id, fecha, peso, cintura, pecho, brazo, pierna, grasa, notas
         FROM mediciones
         WHERE cliente_id = ?
         ORDER BY fecha ASC, id ASC'
    );
    $stmt->bind_param('i', $clienteId);
    $stmt->execute();

    $result = $stmt->get_result();
    $mediciones = [];

    while ($row = $result->fetch_assoc()) {
        $mediciones[] = [
            'id' => (int) $row['id'],
            'cliente_id' => (int) $row['cliente_id'],
            'fecha' => $row['fecha'],
            'peso' => $row['peso'] === null ? null : (float) $row['peso'],
            'cintura' => $row['cintura'] === null ? null : (float) $row['cintura'],
            'pecho' => $row['pecho'] === null ? null : (float) $row['pecho'],
            'brazo' => $row['brazo'] === null ? null : (float) $row['brazo'],
            'pierna' => $row['pierna'] === null ? null : (float) $row['pierna'],
            'grasa' => $row['grasa'] === null ? null : (float) $row['grasa'],
            'notas' => $row['notas'],
        ];
    }

    json_response(['ok' => true, 'data' => $mediciones]);
}

if ($accion === 'editar') {
    $id = (int) ($_POST['id'] ?? 0);
    $fecha = post_value('fecha') ?: date('Y-m-d');
    $peso = decimal_or_null('peso');
    $cintura = decimal_or_null('cintura');
    $pecho = decimal_or_null('pecho');
    $brazo = decimal_or_null('brazo');
    $pierna = decimal_or_null('pierna');
    $grasa = decimal_or_null('grasa');
    $notas = post_value('notas');

    if ($id <= 0) {
        json_response(['ok' => false, 'message' => 'Medición inválida.'], 422);
    }

    $stmt = $conn->prepare(
        'UPDATE mediciones
         SET fecha = ?, peso = ?, cintura = ?, pecho = ?, brazo = ?, pierna = ?, grasa = ?, notas = ?
         WHERE id = ?'
    );
    $stmt->bind_param('sddddddsi', $fecha, $peso, $cintura, $pecho, $brazo, $pierna, $grasa, $notas, $id);
    $stmt->execute();

    json_response(['ok' => true, 'message' => 'Medición actualizada correctamente.']);
}

if ($accion === 'eliminar') {
    $id = (int) ($_POST['id'] ?? 0);

    if ($id <= 0) {
        json_response(['ok' => false, 'message' => 'Medición inválida.'], 422);
    }

    $stmt = $conn->prepare('DELETE FROM mediciones WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();

    json_response(['ok' => true, 'message' => 'Medición eliminada correctamente.']);
}

json_response(['ok' => false, 'message' => 'Acción no válida.'], 400);
