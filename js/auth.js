async function login() {
    const correo = document.getElementById('usuario').value.trim();
    const clave = document.getElementById('clave').value;

    if (!correo || !clave) {
        alert('Ingresa correo y contraseña.');
        return;
    }

    if (correo === 'admin' && clave === '1234') {
        usuarioActual = { id: 0, nombre: 'Administrador', correo: 'admin' };
        mostrarVista('panel');
        dashboard();
        return;
    }

    const data = await api('php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ correo, clave }),
    });

    if (!data.ok) {
        alert(data.message);
        return;
    }

    usuarioActual = data.user;
    mostrarVista('panel');
    dashboard();
}

function mostrarRegistro() {
    mostrarVista('registro');
}

function mostrarRecuperacion() {
    const correoLogin = document.getElementById('usuario').value.trim();
    document.getElementById('rec_correo').value = correoLogin;
    mostrarVista('recuperacion');
}

function volverLogin() {
    mostrarVista('login');
}

function cerrar() {
    usuarioActual = null;
    document.getElementById('clave').value = '';
    mostrarVista('login');
}

async function registrarUsuario() {
    const nombre = document.getElementById('reg_nombre').value.trim();
    const correo = document.getElementById('reg_correo').value.trim();
    const clave = document.getElementById('reg_clave').value;

    const data = await api('php/registro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ nombre, correo, clave }),
    });

    alert(data.message);

    if (data.ok) {
        document.getElementById('ver_correo').value = correo;
        mostrarVista('verificacion');
    }
}

async function verificarCuenta() {
    const correo = document.getElementById('ver_correo').value.trim();
    const codigo = document.getElementById('ver_codigo').value.trim();

    const data = await api('php/verificar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ correo, codigo }),
    });

    alert(data.message);

    if (data.ok) {
        volverLogin();
    }
}

async function enviarRecuperacion() {
    const correo = document.getElementById('rec_correo').value.trim();

    const data = await api('php/recuperar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ correo }),
    });

    alert(data.message);
}

async function cambiarPassword() {
    const correo = document.getElementById('rec_correo').value.trim();
    const codigo = document.getElementById('rec_codigo').value.trim();
    const clave = document.getElementById('rec_clave').value;

    const data = await api('php/cambiar_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ correo, codigo, clave }),
    });

    alert(data.message);

    if (data.ok) {
        document.getElementById('usuario').value = correo;
        document.getElementById('clave').value = '';
        volverLogin();
    }
}
