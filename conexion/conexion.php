<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$hostingConfig = __DIR__ . '/hosting_config.php';
$hosting = file_exists($hostingConfig) ? require $hostingConfig : [];

$host = $hosting['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
$usuario = $hosting['DB_USER'] ?? getenv('DB_USER') ?: 'root';
$password = $hosting['DB_PASSWORD'] ?? (getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '');
$bd = $hosting['DB_NAME'] ?? getenv('DB_NAME') ?: 'gimnasio';
$puerto = (int) ($hosting['DB_PORT'] ?? getenv('DB_PORT') ?: 3306);

try {
    $conn = new mysqli($host, $usuario, $password, $bd, $puerto);
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => 'No se pudo conectar a MySQL.',
        'detail' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function post_value(string $key): string
{
    return trim($_POST[$key] ?? '');
}
