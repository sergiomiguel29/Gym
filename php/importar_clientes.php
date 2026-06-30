<?php
require_once __DIR__ . '/../conexion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
}

if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    json_response(['ok' => false, 'message' => 'Selecciona un archivo CSV válido.'], 422);
}

$archivo = $_FILES['archivo'];
$extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));

if ($extension !== 'csv') {
    json_response(['ok' => false, 'message' => 'El archivo debe tener formato CSV.'], 422);
}

if ($archivo['size'] > 2 * 1024 * 1024) {
    json_response(['ok' => false, 'message' => 'El archivo no debe superar los 2 MB.'], 422);
}

$handle = fopen($archivo['tmp_name'], 'r');

if (!$handle) {
    json_response(['ok' => false, 'message' => 'No se pudo leer el archivo.'], 500);
}

$primeraLinea = fgets($handle);

if ($primeraLinea === false) {
    fclose($handle);
    json_response(['ok' => false, 'message' => 'El archivo está vacío.'], 422);
}

$primeraLinea = preg_replace('/^\xEF\xBB\xBF/', '', $primeraLinea);
$delimitador = substr_count($primeraLinea, ';') > substr_count($primeraLinea, ',') ? ';' : ',';
rewind($handle);

$encabezado = fgetcsv($handle, 0, $delimitador);
$encabezado = array_map(fn($campo) => strtolower(trim((string) $campo)), $encabezado ?: []);
$tieneEncabezado = in_array('nombre', $encabezado, true) && in_array('correo', $encabezado, true);

if (!$tieneEncabezado) {
    rewind($handle);
}

$insertados = 0;
$omitidos = 0;
$errores = [];
$correosArchivo = [];

$stmtExiste = $conn->prepare('SELECT id FROM clientes WHERE correo = ? LIMIT 1');
$stmtInsertar = $conn->prepare('INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)');

$filaNumero = $tieneEncabezado ? 1 : 0;
$conn->begin_transaction();

try {
    while (($fila = fgetcsv($handle, 0, $delimitador)) !== false) {
        $filaNumero++;

        $nombre = trim($fila[0] ?? '');
        $correo = strtolower(trim($fila[1] ?? ''));
        $telefono = trim($fila[2] ?? '');

        if ($nombre === '' && $correo === '' && $telefono === '') {
            continue;
        }

        if ($nombre === '' || $correo === '') {
            $omitidos++;
            $errores[] = "Fila {$filaNumero}: nombre y correo son obligatorios.";
            continue;
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $omitidos++;
            $errores[] = "Fila {$filaNumero}: correo inválido ({$correo}).";
            continue;
        }

        if (isset($correosArchivo[$correo])) {
            $omitidos++;
            $errores[] = "Fila {$filaNumero}: correo duplicado en el archivo ({$correo}).";
            continue;
        }

        $correosArchivo[$correo] = true;

        $stmtExiste->bind_param('s', $correo);
        $stmtExiste->execute();
        $existe = $stmtExiste->get_result()->fetch_assoc();

        if ($existe) {
            $omitidos++;
            $errores[] = "Fila {$filaNumero}: el correo ya existe ({$correo}).";
            continue;
        }

        $stmtInsertar->bind_param('sss', $nombre, $correo, $telefono);
        $stmtInsertar->execute();
        $insertados++;
    }

    $conn->commit();
} catch (Throwable $e) {
    $conn->rollback();
    fclose($handle);
    json_response([
        'ok' => false,
        'message' => 'No se pudo completar la importación.',
        'detail' => $e->getMessage(),
    ], 500);
}

fclose($handle);

json_response([
    'ok' => true,
    'message' => "Importación finalizada. Clientes registrados: {$insertados}. Filas omitidas: {$omitidos}.",
    'insertados' => $insertados,
    'omitidos' => $omitidos,
    'errores' => array_slice($errores, 0, 20),
]);
