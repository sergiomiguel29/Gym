# Proyecto Gimnasio con Docker

Este proyecto puede ejecutarse con Docker para evitar configurar XAMPP y MySQL manualmente en cada laptop.

## Requisitos

- Docker Desktop instalado.
- Git instalado.
- Puertos libres:
  - `8080` para la aplicacion web.
  - `3307` para MySQL.

## Instalacion en otra PC

Clonar el repositorio:

```bash
git clone https://github.com/sergiomiguel29/Gym.git
cd Gym
```

Crear el archivo `.env` desde el ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell tambien se puede usar:

```powershell
Copy-Item .env.example .env
```

Levantar el sistema:

```bash
docker compose up -d --build
```

## Instalacion usando Docker Hub

Imagen publicada:

```text
https://hub.docker.com/r/sergio0129/gym-web
```

Tambien se puede levantar usando la imagen publicada en Docker Hub:

```bash
git clone https://github.com/sergiomiguel29/Gym.git
cd Gym
cp .env.example .env
docker compose -f docker-compose.hub.yml up -d
```

En Windows PowerShell:

```powershell
git clone https://github.com/sergiomiguel29/Gym.git
cd Gym
Copy-Item .env.example .env
docker compose -f docker-compose.hub.yml up -d
```

Abrir en el navegador:

```text
http://localhost:8080
```

## Base de datos

Docker crea automaticamente la base `gimnasio` y sus tablas desde:

```text
database/init.sql
```

Tablas principales:

- `usuarios`
- `clientes`
- `rutinas`
- `ejercicios`

## Variables de entorno

El archivo `.env` contiene la configuracion de conexion:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=gimnasio
DB_USER=gym_user
DB_PASSWORD=gym_password
MYSQL_ROOT_PASSWORD=root_password
```

## Pipeline DevOps

El proyecto incluye un pipeline con GitHub Actions en:

```text
.github/workflows/docker-ci.yml
```

El pipeline se ejecuta automaticamente cuando se suben cambios a la rama `main` y valida:

- Configuracion de Docker Compose.
- Construccion de la imagen Docker.
- Arranque de los contenedores web y base de datos.
- Respuesta de la aplicacion en `http://localhost:8080`.
- Conexion basica con el endpoint de clientes.

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
