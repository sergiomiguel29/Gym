let usuarioActual = null;
let charts = [];
let clienteCharts = [];
let clientesCache = [];
let rutinasCache = [];
let ejerciciosCache = {};
let medicionesCache = [];
let medicionesChart = null;

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const clientesMes = [25, 9, 15, 6, 8, 26, 10, 14, 10, 7, 8, 28];
const asistencias = [88, 92, 67, 61, 32, 35, 71, 69, 51, 56, 25, 37];
const faltas = [37, 32, 37, 33, 64, 65, 25, 18, 50, 41, 59, 74];
const nuevosClientes = [12, 15, 20, 11, 8, 25, 17, 21, 14, 10, 9, 28];
const eventos = [4, 6, 5, 8, 3, 2, 7, 9, 4, 5, 6, 8];
const ocupacion = [70, 72, 75, 78, 80, 82, 85, 88, 84, 81, 79, 90];
const ingresosMes = [5000, 3200, 4800, 2100, 2600, 6200, 3400, 4200, 3900, 2500, 2700, 12949];

window.onload = function () {
    mostrarVista('login');
};

function mostrarVista(vista) {
    document.getElementById('login').style.display = vista === 'login' ? 'flex' : 'none';
    document.getElementById('registro').style.display = vista === 'registro' ? 'flex' : 'none';
    document.getElementById('verificacion').style.display = vista === 'verificacion' ? 'flex' : 'none';
    document.getElementById('recuperacion').style.display = vista === 'recuperacion' ? 'flex' : 'none';
    document.getElementById('panel').style.display = vista === 'panel' ? 'flex' : 'none';

    if (vista !== 'panel') {
        document.getElementById('contenido').innerHTML = '';
    }
}

function encodeForm(datos) {
    return new URLSearchParams(datos).toString();
}

async function api(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const texto = await respuesta.text();

    try {
        return JSON.parse(texto);
    } catch (error) {
        return { ok: false, message: texto || 'Respuesta inválida del servidor.' };
    }
}

function escapar(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function sumar(lista) {
    return lista.reduce((total, valor) => total + valor, 0);
}

function formatoSoles(valor) {
    return `S/. ${Number(valor).toLocaleString('es-PE')}`;
}
