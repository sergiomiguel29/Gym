# Guia rapida para subir a InfinityFree

## 1. Crear base de datos MySQL

En el panel de InfinityFree:

1. Entrar a `MySQL Databases`.
2. Crear una base de datos, por ejemplo `gimnasio`.
3. Copiar estos datos:
   - MySQL Host Name
   - MySQL Database Name
   - MySQL Username
   - MySQL Password

## 2. Importar tablas

Entrar a phpMyAdmin desde InfinityFree e importar:

```text
database/infinityfree_tables.sql
```

Ese archivo crea las tablas:

- usuarios
- clientes
- rutinas
- ejercicios

## 3. Configurar conexion

En la carpeta `conexion`, copiar:

```text
hosting_config.example.php
```

y renombrarlo como:

```text
hosting_config.php
```

Luego editarlo con los datos reales de InfinityFree:

```php
<?php

return [
    'DB_HOST' => 'sqlXXX.infinityfree.com',
    'DB_USER' => 'if0_XXXXXXXX',
    'DB_PASSWORD' => 'TU_PASSWORD_DE_MYSQL',
    'DB_NAME' => 'if0_XXXXXXXX_gimnasio',
    'DB_PORT' => 3306,
];
```

## 4. Subir archivos

Subir el contenido del proyecto dentro de:

```text
htdocs
```

No subir estos archivos/carpetas:

- `.git`
- `.env`
- `backup_modular_*`
- archivos `.zip`

## 5. Probar

Abrir el dominio asignado por InfinityFree.

Tambien se puede probar el endpoint:

```text
https://TU-DOMINIO/php/clientes.php?accion=listar
```

Si responde algo como esto, la conexion esta bien:

```json
{"ok":true,"data":[]}
```
