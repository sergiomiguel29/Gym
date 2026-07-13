<?php
require_once __DIR__ . '/../conexion/conexion.php';

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

if ($accion === 'agregarRutina') {
    $idCliente = (int) ($_POST['idCliente'] ?? 0);
    $semana = post_value('semana');
    $fecha = date('Y-m-d');

    if ($idCliente <= 0 || $semana === '') {
        json_response([
            'ok' => false,
            'message' => 'Datos inválidos para crear rutina.',
        ], 422);
    }

    $stmt = $conn->prepare('INSERT INTO rutinas (cliente_id, dia_semana, fecha) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $idCliente, $semana, $fecha);
    $stmt->execute();

    json_response([
        'ok' => true,
        'message' => 'Rutina agregada correctamente.',
        'id' => $conn->insert_id,
    ]);
}

if ($accion === 'listarRutinas') {
    $idCliente = (int) ($_GET['idCliente'] ?? 0);

    if ($idCliente <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Cliente inválido.',
        ], 422);
    }

    $stmt = $conn->prepare('SELECT id, dia_semana, fecha FROM rutinas WHERE cliente_id = ? ORDER BY id DESC');
    $stmt->bind_param('i', $idCliente);
    $stmt->execute();

    $result = $stmt->get_result();
    $rutinas = [];

    while ($row = $result->fetch_assoc()) {
        $rutinas[] = [
            'id' => (int) $row['id'],
            'semana' => $row['dia_semana'],
            'fecha' => $row['fecha'],
        ];
    }

    json_response([
        'ok' => true,
        'data' => $rutinas,
    ]);
}

if ($accion === 'editarRutina') {
    $idRutina = (int) ($_POST['idRutina'] ?? 0);
    $semana = post_value('semana');

    if ($idRutina <= 0 || $semana === '') {
        json_response([
            'ok' => false,
            'message' => 'Datos inválidos para actualizar la rutina.',
        ], 422);
    }

    $stmt = $conn->prepare('UPDATE rutinas SET dia_semana = ? WHERE id = ?');
    $stmt->bind_param('si', $semana, $idRutina);
    $stmt->execute();

    json_response([
        'ok' => true,
        'message' => 'Rutina actualizada correctamente.',
    ]);
}

if ($accion === 'eliminarRutina') {
    $idRutina = (int) ($_POST['idRutina'] ?? 0);

    if ($idRutina <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Rutina inválida.',
        ], 422);
    }

    $stmt = $conn->prepare('DELETE FROM rutinas WHERE id = ?');
    $stmt->bind_param('i', $idRutina);
    $stmt->execute();

    json_response([
        'ok' => true,
        'message' => 'Rutina eliminada correctamente.',
    ]);
}

if ($accion === 'evolucionCliente') {
    $idCliente = (int) ($_GET['idCliente'] ?? 0);

    if ($idCliente <= 0) {
        json_response([
            'ok' => false,
            'message' => 'Cliente inválido.',
        ], 422);
    }

    $stmt = $conn->prepare(
        "SELECT
            YEARWEEK(r.fecha, 3) AS semana_numero,
            MIN(r.fecha) AS inicio_semana,
            COUNT(DISTINCT r.id) AS rutinas,
            COUNT(e.id) AS ejercicios,
            COALESCE(SUM(e.series * e.repeticiones), 0) AS repeticiones,
            COALESCE(SUM(e.series * e.repeticiones * e.peso), 0) AS volumen
        FROM rutinas r
        LEFT JOIN ejercicios e ON e.rutina_id = r.id
        WHERE r.cliente_id = ?
        GROUP BY YEARWEEK(r.fecha, 3)
        ORDER BY inicio_semana ASC"
    );
    $stmt->bind_param('i', $idCliente);
    $stmt->execute();

    $result = $stmt->get_result();
    $evolucion = [];

    while ($row = $result->fetch_assoc()) {
        $evolucion[] = [
            'semana' => date('d/m/Y', strtotime($row['inicio_semana'])),
            'rutinas' => (int) $row['rutinas'],
            'ejercicios' => (int) $row['ejercicios'],
            'repeticiones' => (int) $row['repeticiones'],
            'volumen' => (float) $row['volumen'],
        ];
    }

    json_response([
        'ok' => true,
        'data' => $evolucion,
    ]);
}

json_response([
    'ok' => false,
    'message' => 'Acción no válida.',
], 400);
