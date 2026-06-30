# Ejecución con Docker

Este proyecto puede ejecutarse con Docker para evitar configurar XAMPP manualmente en cada laptop.

## Requisitos

- Docker Desktop instalado.
- Puertos libres:
  - `8080` para la web.
  - `3307` para MySQL.

## Levantar el sistema

Desde la carpeta del proyecto:

```bash
docker compose up -d --build
```

Abrir en el navegador:

```text
http://localhost:8080
```

## Base de datos

Docker crea automáticamente la base `gimnasio` y sus tablas desde:

```text
database/init.sql
```

Tablas creadas:

- `usuarios`
- `clientes`
- `rutinas`
- `ejercicios`

## Variables de entorno

La configuración está en:

```text
.env
```

Ejemplo:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=gimnasio
DB_USER=gym_user
DB_PASSWORD=gym_password
MYSQL_ROOT_PASSWORD=root_password
```

## Detener el sistema

```bash
docker compose down
```

## Reiniciar borrando la base de datos

Usar solo si se desea empezar desde cero:

```bash
docker compose down -v
docker compose up -d --build
```
