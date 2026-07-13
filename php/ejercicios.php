<?php
require_once __DIR__ . '/../conexion/conexion.php';

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

if ($accion === 'agregar') {
    $idRutina = (int) ($_POST['idRutina'] ?? 0);
    $ejercicio = post_value('ejercicio');
    $series = (int) ($_POST['series'] ?? 0);
    $reps = (int) ($_POST['reps'] ?? 0);
    $peso = (float) ($_POST['peso'] ?? 0);

    if ($idRutina <= 0 || $ejercicio === '' || $series <= 0 || $reps <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Completa ejercicio, series y repeticiones.',
        ], 422);
    }

    $stmt = $conn->prepare(
        'INSERT INTO ejercicios (rutina_id, tipo_ejercicio, series, repeticiones, peso) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('isiid', $idRutina, $ejercicio, $series, $reps, $peso);
    $stmt->execute();

    json_response([
        'ok' => true,
        'message' => 'Ejercicio agregado correctamente.',
    ]);
}

if ($accion === 'listar') {
    $idRutina = (int) ($_GET['idRutina'] ?? 0);

    if ($idRutina <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Rutina inválida.',
        ], 422);
    }

    $stmt = $conn->prepare(
        'SELECT id, tipo_ejercicio, series, repeticiones, peso FROM ejercicios WHERE rutina_id = ? ORDER BY id ASC'
    );
    $stmt->bind_param('i', $idRutina);
    $stmt->execute();

    $result = $stmt->get_result();
    $ejercicios = [];

    while ($row = $result->fetch_assoc()) {
        $ejercicios[] = [
            'id' => (int) $row['id'],
            'ejercicio' => $row['tipo_ejercicio'],
            'series' => (int) $row['series'],
            'reps' => (int) $row['repeticiones'],
            'peso' => (float) $row['peso'],
        ];
    }

    json_response([
        'ok' => true,
        'data' => $ejercicios,
    ]);
}

if ($accion === 'editar') {
    $idEjercicio = (int) ($_POST['idEjercicio'] ?? 0);
    $ejercicio = post_value('ejercicio');
    $series = (int) ($_POST['series'] ?? 0);
    $reps = (int) ($_POST['reps'] ?? 0);
    $peso = (float) ($_POST['peso'] ?? 0);

    if ($idEjercicio <= 0 || $ejercicio === '' || $series <= 0 || $reps <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Completa ejercicio, series y repeticiones.',
        ], 422);
    }

    $stmt = $conn->prepare(
        'UPDATE ejercicios SET tipo_ejercicio = ?, series = ?, repeticiones = ?, peso = ? WHERE id = ?'
    );
    $stmt->bind_param('siidi', $ejercicio, $series, $reps, $peso, $idEjercicio);
    $stmt->execute();

    json_response([
        'ok' => true,
        'message' => 'Ejercicio actualizado correctamente.',
    ]);
}

if ($accion === 'eliminar') {
    $idEjercicio = (int) ($_POST['idEjercicio'] ?? 0);

    if ($idEjercicio <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Ejercicio inválido.',
        ], 422);
    }

    $stmt = $conn->prepare('DELETE FROM ejercicios WHERE id = ?');
    $stmt->bind_param('i', $idEjercicio);
    $stmt->execute();

    json_response([
        'ok' => true,
        'message' => 'Ejercicio eliminado correctamente.',
    ]);
}

json_response([
    'ok' => false,
    'message' => 'Acción no válida.',
], 400);
