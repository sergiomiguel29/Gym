let usuarioActual = null;
let charts = [];
let clienteCharts = [];
let clientesCache = [];

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

function dashboard() {
    document.getElementById('contenido').innerHTML = `
        <div class="dashboard-header">
            <div class="brand-heading">
                <img class="brand-mark" src="img/logo-devioz.png" alt="Logo Devioz">
                <div>
                    <h1 class="titulo-dashboard">Dashboard BI Gym</h1>
                    <p class="subtitulo">Business Intelligence 2025</p>
                </div>
            </div>
            <div class="filtros">
                <select id="filtroMes" onchange="filtrarDashboard()">
                    <option value="Todos">Todo 2025</option>
                    ${meses.map((mes) => `<option value="${mes}">${mes}</option>`).join('')}
                </select>
            </div>
        </div>

        <div class="top-dashboard">
            <div class="kpi"><h3>Total Clientes</h3><p id="kpiClientes">${sumar(clientesMes)}</p></div>
            <div class="kpi"><h3>Asistencias</h3><p id="kpiAsistencia">${sumar(asistencias)}</p></div>
            <div class="kpi"><h3>Faltas</h3><p id="kpiFaltas">${sumar(faltas)}</p></div>
            <div class="kpi"><h3>Eventos</h3><p id="kpiEventos">${sumar(eventos)}</p></div>
            <div class="kpi"><h3>Ingresos</h3><p id="kpiIngresos">${formatoSoles(sumar(ingresosMes))}</p></div>
        </div>

        <div class="charts-grid">
            <div class="chart-card"><h2>Clientes por Mes</h2><canvas id="graficoClientes"></canvas></div>
            <div class="chart-card"><h2>Asistencias vs Faltas</h2><canvas id="graficoAsistencia"></canvas></div>
            <div class="chart-card"><h2>Nuevos Clientes</h2><canvas id="graficoNuevos"></canvas></div>
            <div class="chart-card"><h2>Eventos Operativos</h2><canvas id="graficoEventos"></canvas></div>
            <div class="chart-card"><h2>Ocupación</h2><canvas id="graficoOcupacion"></canvas></div>
            <div class="chart-card"><h2>Ingresos Mensuales</h2><canvas id="graficoIngresos"></canvas></div>
        </div>
    `;

    filtrarDashboard();
}

function filtrarDashboard() {
    const mesSeleccionado = document.getElementById('filtroMes')?.value || 'Todos';

    let labels = meses;
    let clientes = clientesMes;
    let asistencia = asistencias;
    let falta = faltas;
    let nuevos = nuevosClientes;
    let evento = eventos;
    let ocupa = ocupacion;
    let ingreso = ingresosMes;

    if (mesSeleccionado !== 'Todos') {
        const index = meses.indexOf(mesSeleccionado);
        labels = [mesSeleccionado];
        clientes = [clientesMes[index]];
        asistencia = [asistencias[index]];
        falta = [faltas[index]];
        nuevos = [nuevosClientes[index]];
        evento = [eventos[index]];
        ocupa = [ocupacion[index]];
        ingreso = [ingresosMes[index]];
    }

    actualizarKpis(clientes, asistencia, falta, evento, ingreso);
    crearGraficosFiltrados(labels, clientes, asistencia, falta, nuevos, evento, ocupa, ingreso);
}

function actualizarKpis(clientes, asistencia, falta, evento, ingreso) {
    document.getElementById('kpiClientes').innerText = sumar(clientes);
    document.getElementById('kpiAsistencia').innerText = sumar(asistencia);
    document.getElementById('kpiFaltas').innerText = sumar(falta);
    document.getElementById('kpiEventos').innerText = sumar(evento);
    document.getElementById('kpiIngresos').innerText = formatoSoles(sumar(ingreso));
}

function crearGraficosFiltrados(labels, clientes, asistencia, falta, nuevos, evento, ocupa, ingreso) {
    charts.forEach((chart) => chart.destroy());
    charts = [];

    Chart.defaults.color = '#334155';
    Chart.defaults.font.family = 'Arial, sans-serif';

    const opciones = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900 },
        plugins: {
            legend: { labels: { color: '#334155', font: { family: 'Arial' } } },
        },
        scales: {
            x: { ticks: { color: '#334155', autoSkip: false, font: { family: 'Arial' } } },
            y: { beginAtZero: true, ticks: { color: '#334155', font: { family: 'Arial' } } },
        },
    };

    charts.push(new Chart(document.getElementById('graficoClientes'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Clientes', data: clientes, backgroundColor: '#16a34a', borderRadius: 10 }] },
        options: opciones,
    }));

    charts.push(new Chart(document.getElementById('graficoAsistencia'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Asistencias', data: asistencia, backgroundColor: '#2563eb' },
                { label: 'Faltas', data: falta, backgroundColor: '#dc2626' },
            ],
        },
        options: opciones,
    }));

    charts.push(new Chart(document.getElementById('graficoNuevos'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Nuevos Clientes', data: nuevos, backgroundColor: '#7c3aed', borderRadius: 10 }] },
        options: opciones,
    }));

    charts.push(new Chart(document.getElementById('graficoEventos'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Eventos', data: evento, backgroundColor: '#0891b2', borderRadius: 10 }] },
        options: opciones,
    }));

    charts.push(new Chart(document.getElementById('graficoOcupacion'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Ocupación %', data: ocupa, backgroundColor: '#f59e0b', borderRadius: 10 }] },
        options: opciones,
    }));

    charts.push(new Chart(document.getElementById('graficoIngresos'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Ingresos', data: ingreso, backgroundColor: '#10b981', borderRadius: 10 }] },
        options: opciones,
    }));
}

function reportes() {
    document.getElementById('contenido').innerHTML = `
        <div class="card">
            <div class="report-brand">
                <img src="img/logo-devioz.png" alt="Logo Devioz">
                <div>
                    <h2>Reporte Ejecutivo BI</h2>
                    <p>Business Intelligence respaldado por Devioz.</p>
                </div>
            </div>
            <p>
                El sistema Business Intelligence desarrollado para GYM PRO permite analizar indicadores operativos,
                financieros y comerciales mediante dashboards interactivos. El reporte profesional incluye análisis
                estratégico de clientes, ingresos, ocupación, asistencias y comportamiento operativo del gimnasio
                durante el periodo 2025.
            </p>
            <button class="accion" onclick="generarPDF()">Exportar PDF Profesional</button>
        </div>
    `;
}

async function cargarImagenBase64(ruta) {
    const respuesta = await fetch(ruta);
    const blob = await respuesta.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });
}

function textoCentradoPDF(pdf, texto, y, fontSize = 12) {
    pdf.setFontSize(fontSize);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const textWidth = pdf.getTextWidth(texto);
    pdf.text(texto, (pageWidth - textWidth) / 2, y);
}

async function generarPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('No se cargo jsPDF. Revisa tu conexion a internet o descarga la libreria localmente.');
        return;
    }

    dashboard();

    setTimeout(async () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const logoDevioz = await cargarImagenBase64('img/logo-devioz.png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margen = 15;

        function tituloPagina(titulo, subtitulo = '') {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            if (logoDevioz) {
                pdf.addImage(logoDevioz, 'PNG', margen, 10, 48, 19);
            }

            pdf.setTextColor(20, 83, 45);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(21);
            pdf.text(titulo, margen, 42);

            if (subtitulo) {
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                pdf.text(subtitulo, margen, 50);
            }

            pdf.setDrawColor(226, 232, 240);
            pdf.line(margen, 56, pageWidth - margen, 56);
        }

        function textoParrafo(texto, x, y, ancho, size = 11) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(size);
            pdf.setTextColor(51, 65, 85);
            pdf.text(pdf.splitTextToSize(texto, ancho), x, y);
        }

        async function agregarGrafico(idCanvas, titulo, texto, posY) {
            const canvas = document.getElementById(idCanvas);
            const imagen = canvas.toDataURL('image/png');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.setTextColor(20, 83, 45);
            pdf.text(titulo, margen, posY);

            pdf.setDrawColor(226, 232, 240);
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margen, posY + 7, 82, 55, 3, 3, 'FD');
            pdf.addImage(imagen, 'PNG', margen + 2, posY + 9, 78, 50);

            textoParrafo(texto, 105, posY + 17, 88, 10.5);
        }

        // Portada
        pdf.setFillColor(20, 83, 45);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        if (logoDevioz) {
            const logoWidth = 138;
            const logoHeight = 56;
            pdf.addImage(logoDevioz, 'PNG', (pageWidth - logoWidth) / 2, 32, logoWidth, logoHeight);
        }

        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        textoCentradoPDF(pdf, 'GYM PRO BI', 112, 32);

        pdf.setFont('helvetica', 'normal');
        textoCentradoPDF(pdf, 'Reporte Ejecutivo Business Intelligence', 128, 17);

        pdf.setTextColor(220, 252, 231);
        textoCentradoPDF(pdf, `Fecha: ${new Date().toLocaleDateString('es-PE')}`, 140, 11);

        const intro = 'Informe ejecutivo orientado al analisis operativo y financiero del gimnasio. El dashboard permite visualizar indicadores clave, controlar rendimiento y apoyar la toma de decisiones gerenciales.';
        pdf.setTextColor(240, 253, 244);
        pdf.setFontSize(12);
        const introLines = pdf.splitTextToSize(intro, 160);
        pdf.text(introLines, (pageWidth - 160) / 2, 166);

        // Indicadores
        pdf.addPage();
        tituloPagina('Indicadores Principales', 'Resumen ejecutivo del periodo 2025');

        const kpis = [
            ['Clientes Totales', sumar(clientesMes)],
            ['Total Asistencias', sumar(asistencias)],
            ['Total Faltas', sumar(faltas)],
            ['Eventos Operativos', sumar(eventos)],
            ['Ingresos Totales', formatoSoles(sumar(ingresosMes))],
        ];

        let yKpi = 72;
        kpis.forEach(([label, value]) => {
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(margen, yKpi - 8, 180, 16, 3, 3, 'FD');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(71, 85, 105);
            pdf.text(label, margen + 6, yKpi + 1);
            pdf.setTextColor(22, 163, 74);
            pdf.text(String(value), 150, yKpi + 1);
            yKpi += 20;
        });

        textoParrafo('Los indicadores muestran estabilidad operativa y crecimiento sostenido durante el periodo analizado. La informacion evidencia comportamiento positivo en ocupacion, captacion de clientes y rentabilidad financiera.', margen, 180, 175, 11);

        await agregarGrafico('graficoClientes', 'Clientes por Mes', 'El comportamiento mensual de clientes evidencia crecimiento progresivo en determinados periodos. Los meses de mayor incremento reflejan efectividad en estrategias comerciales y campanas de captacion.', 215);

        // Pagina 3
        pdf.addPage();
        tituloPagina('Analisis Operativo', 'Asistencias, faltas y captacion de nuevos clientes');
        await agregarGrafico('graficoAsistencia', 'Asistencias vs Faltas', 'La comparacion entre asistencias y faltas permite evaluar el nivel de compromiso de los clientes y encontrar oportunidades de mejora en fidelizacion.', 72);
        await agregarGrafico('graficoNuevos', 'Nuevos Clientes', 'La captacion de nuevos usuarios presenta comportamiento favorable durante meses especificos, evidenciando impacto positivo de promociones y estrategias digitales.', 162);

        // Pagina 4
        pdf.addPage();
        tituloPagina('Actividad y Ocupacion', 'Eventos operativos y uso de capacidad');
        await agregarGrafico('graficoEventos', 'Eventos Operativos', 'Los eventos operativos fortalecen la participacion institucional y contribuyen al incremento de actividad comercial.', 72);
        await agregarGrafico('graficoOcupacion', 'Ocupacion del Gimnasio', 'La ocupacion promedio mantiene una tendencia estable, evidenciando adecuada gestion operativa y uso eficiente de infraestructura.', 162);

        // Pagina 5
        pdf.addPage();
        tituloPagina('Resultados Financieros', 'Ingresos mensuales y recomendaciones');
        await agregarGrafico('graficoIngresos', 'Ingresos Mensuales', 'El comportamiento financiero presenta estabilidad y crecimiento progresivo. La visualizacion BI facilita identificar temporadas de mayor rentabilidad.', 72);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.setTextColor(20, 83, 45);
        pdf.text('Conclusiones Estrategicas', margen, 160);
        textoParrafo(`- La implementacion del dashboard BI mejora la visualizacion y control de indicadores.\n\n- El sistema optimiza la toma de decisiones mediante analisis automatizado.\n\n- Los ingresos y niveles de ocupacion reflejan estabilidad operativa.\n\n- La analitica de datos facilita identificar oportunidades de crecimiento.`, margen, 172, 175, 10.5);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.setTextColor(20, 83, 45);
        pdf.text('Recomendaciones', margen, 235);
        textoParrafo(`- Implementar modelos predictivos de comportamiento de clientes.\n\n- Fortalecer estrategias de fidelizacion y seguimiento personalizado.\n\n- Integrar alertas inteligentes para indicadores criticos.\n\n- Expandir dashboards para monitoreo financiero y operativo en tiempo real.`, margen, 247, 175, 10.5);

        pdf.save('Reporte_Ejecutivo_GYM_PRO_BI.pdf');
    }, 1200);
}

function clientes() {
    document.getElementById('contenido').innerHTML = `
        <h1 class="titulo-dashboard">Gestión de Clientes</h1>

        <div class="card form-card">
            <h2>Registrar Cliente</h2>
            <input type="text" id="cliNombre" placeholder="Nombre completo">
            <input type="email" id="cliCorreo" placeholder="Correo electrónico">
            <input type="text" id="cliTelefono" placeholder="Teléfono">
            <button class="accion" onclick="guardarCliente()">Guardar Cliente</button>
        </div>

        <div class="card search-card">
            <h2>Buscar Cliente</h2>
            <div class="search-row">
                <input type="text" id="buscarCliente" placeholder="Buscar por nombre, correo o teléfono" onkeydown="buscarConEnter(event)">
                <button class="accion accion-inline" onclick="buscarCliente()">Buscar</button>
                <button class="accion accion-secundaria accion-inline" onclick="limpiarBusqueda()">Limpiar</button>
            </div>
        </div>

        <div class="card">
            <h2>Lista de Clientes</h2>
            <div id="tablaClientes"></div>
        </div>

        <div id="modalEditarCliente" class="modal-overlay" style="display:none;">
            <div class="modal-card modal-card-cliente">
                <div class="modal-header modal-header-green">
                    <div>
                        <h2>Editar Cliente</h2>
                        <p>Actualiza los datos del cliente seleccionado.</p>
                    </div>
                    <button class="modal-close" onclick="cerrarModalEditar()">×</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="editClienteId">
                    <label>Nombre completo</label>
                    <input type="text" id="editNombre" placeholder="Nombre completo">
                    <label>Correo electrónico</label>
                    <input type="email" id="editCorreo" placeholder="Correo electrónico">
                    <label>Teléfono</label>
                    <input type="text" id="editTelefono" placeholder="Teléfono">
                </div>
                <div class="modal-actions">
                    <button class="accion accion-secundaria" onclick="cerrarModalEditar()">Cancelar</button>
                    <button class="accion" onclick="guardarEdicionCliente()">Guardar cambios</button>
                </div>
            </div>
        </div>
    `;

    cargarClientes();
}

async function guardarCliente() {
    const nombre = document.getElementById('cliNombre').value.trim();
    const correo = document.getElementById('cliCorreo').value.trim();
    const telefono = document.getElementById('cliTelefono').value.trim();

    const data = await api('php/clientes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'guardar', nombre, correo, telefono }),
    });

    alert(data.message);

    if (data.ok) {
        document.getElementById('cliNombre').value = '';
        document.getElementById('cliCorreo').value = '';
        document.getElementById('cliTelefono').value = '';
        cargarClientes();
    }
}

async function cargarClientes() {
    const data = await api('php/clientes.php?accion=listar');

    if (!data.ok) {
        document.getElementById('tablaClientes').innerHTML = `<p>${escapar(data.message)}</p>`;
        return;
    }

    clientesCache = data.data;
    renderClientes();
}

function buscarConEnter(event) {
    if (event.key === 'Enter') buscarCliente();
}

function buscarCliente() {
    renderClientes();
}

function limpiarBusqueda() {
    document.getElementById('buscarCliente').value = '';
    renderClientes();
}

function renderClientes() {
    const filtro = (document.getElementById('buscarCliente')?.value || '').toLowerCase();
    const clientesFiltrados = clientesCache.filter((cliente) => {
        return `${cliente.nombre} ${cliente.correo} ${cliente.telefono}`.toLowerCase().includes(filtro);
    });

    if (clientesFiltrados.length === 0) {
        document.getElementById('tablaClientes').innerHTML = '<p>No hay clientes para mostrar.</p>';
        return;
    }

    document.getElementById('tablaClientes').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${clientesFiltrados.map((cliente) => `
                    <tr>
                        <td>${cliente.id}</td>
                        <td>${escapar(cliente.nombre)}</td>
                        <td>${escapar(cliente.correo)}</td>
                        <td>${escapar(cliente.telefono)}</td>
                        <td class="acciones-tabla">
                            <button onclick="editarCliente(${cliente.id})">Editar</button>
                            <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                            <button onclick="verRutinas(${cliente.id})">Rutinas</button>
                            <button onclick="verEvolucionCliente(${cliente.id})">Evolución</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function eliminarCliente(id) {
    if (!confirm('¿Eliminar cliente?')) return;

    const data = await api('php/clientes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'eliminar', id }),
    });

    alert(data.message);
    if (data.ok) cargarClientes();
}

function editarCliente(id) {
    const cliente = clientesCache.find((item) => item.id === id);

    if (!cliente) {
        alert('Cliente no encontrado.');
        return;
    }

    document.getElementById('editClienteId').value = cliente.id;
    document.getElementById('editNombre').value = cliente.nombre;
    document.getElementById('editCorreo').value = cliente.correo;
    document.getElementById('editTelefono').value = cliente.telefono || '';
    document.getElementById('modalEditarCliente').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('modalEditarCliente').style.display = 'none';
}

async function guardarEdicionCliente() {
    const id = document.getElementById('editClienteId').value;
    const nombre = document.getElementById('editNombre').value.trim();
    const correo = document.getElementById('editCorreo').value.trim();
    const telefono = document.getElementById('editTelefono').value.trim();

    if (!nombre || !correo) {
        alert('Nombre y correo son obligatorios.');
        return;
    }

    const data = await api('php/clientes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'editar', id, nombre, correo, telefono }),
    });

    alert(data.message);

    if (data.ok) {
        cerrarModalEditar();
        cargarClientes();
    }
}

function verRutinas(id) {
    const cliente = clientesCache.find((item) => item.id === id);
    document.getElementById('contenido').innerHTML = `
        <div class="dashboard-header">
            <div class="brand-heading">
                <img class="brand-mark" src="img/logo-devioz.png" alt="Logo Devioz">
                <div>
                    <h1 class="titulo-dashboard">Rutinas de ${escapar(cliente?.nombre || 'cliente')}</h1>
                    <p class="subtitulo">Registra lo trabajado por día de entrenamiento</p>
                </div>
            </div>
            <button class="accion accion-secundaria" onclick="clientes()">Volver a clientes</button>
        </div>

        <div class="rutina-layout">
            <div class="card rutina-panel">
                <h2>Nueva rutina</h2>
                <label>Día de entrenamiento</label>
                <select id="rutinaDia">
                    <option>Lunes</option>
                    <option>Martes</option>
                    <option>Miércoles</option>
                    <option>Jueves</option>
                    <option>Viernes</option>
                    <option>Sábado</option>
                    <option>Domingo</option>
                </select>
                <button class="accion" onclick="crearRutinaDesdeFormulario(${id})">Crear rutina del día</button>
            </div>

            <div class="card rutina-panel">
                <h2>Agregar ejercicio</h2>
                <label>Rutina</label>
                <select id="selectRutina"></select>
                <label>Ejercicio realizado</label>
                <input type="text" id="ejercicioNombre" placeholder="Ejemplo: Press banca">
                <div class="rutina-grid-form">
                    <div>
                        <label>Series</label>
                        <input type="number" id="ejercicioSeries" min="1" value="3">
                    </div>
                    <div>
                        <label>Reps</label>
                        <input type="number" id="ejercicioReps" min="1" value="12">
                    </div>
                    <div>
                        <label>Peso kg</label>
                        <input type="number" id="ejercicioPeso" min="0" step="0.5" value="0">
                    </div>
                </div>
                <button class="accion" onclick="agregarEjercicioRutina(${id})">Guardar ejercicio</button>
            </div>
        </div>

        <div class="card">
            <h2>Rutinas guardadas</h2>
            <div id="rutinasCliente">Cargando...</div>
        </div>
    `;
    cargarRutinas(id);
}

async function crearRutinaDesdeFormulario(idCliente) {
    const semana = document.getElementById('rutinaDia').value;
    await agregarRutina(idCliente, semana);
}

async function agregarRutina(idCliente, semana) {
    const data = await api('php/rutinas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'agregarRutina', idCliente, semana }),
    });

    alert(data.message);
    if (data.ok) cargarRutinas(idCliente);
}

async function cargarRutinas(idCliente) {
    const data = await api(`php/rutinas.php?accion=listarRutinas&idCliente=${encodeURIComponent(idCliente)}`);

    if (!data.ok) {
        document.getElementById('rutinasCliente').innerHTML = `<p>${escapar(data.message)}</p>`;
        return;
    }

    const select = document.getElementById('selectRutina');
    if (select) {
        select.innerHTML = data.data.length
            ? data.data.map((rutina) => `<option value="${rutina.id}">${escapar(rutina.semana)} - rutina #${rutina.id}</option>`).join('')
            : '<option value="">Primero crea una rutina</option>';
    }

    document.getElementById('rutinasCliente').innerHTML = data.data.length
        ? data.data.map((rutina) => `
            <div class="rutina-item">
                <div class="rutina-item-head">
                    <strong>${escapar(rutina.semana)}</strong>
                    <span>Rutina #${rutina.id}</span>
                </div>
                <div class="ejercicios-lista" id="ejercicios-rutina-${rutina.id}">Cargando ejercicios...</div>
            </div>
        `).join('')
        : '<p>No hay rutinas guardadas para este cliente.</p>';

    data.data.forEach((rutina) => cargarEjerciciosRutina(rutina.id));
}

async function agregarEjercicioRutina(idCliente) {
    const idRutina = document.getElementById('selectRutina').value;
    const ejercicio = document.getElementById('ejercicioNombre').value.trim();
    const series = document.getElementById('ejercicioSeries').value;
    const reps = document.getElementById('ejercicioReps').value;
    const peso = document.getElementById('ejercicioPeso').value;

    if (!idRutina) {
        alert('Primero crea una rutina para un día.');
        return;
    }

    if (!ejercicio) {
        alert('Escribe el ejercicio realizado.');
        return;
    }

    const data = await api('php/ejercicios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'agregar', idRutina, ejercicio, series, reps, peso }),
    });

    alert(data.message);

    if (data.ok) {
        document.getElementById('ejercicioNombre').value = '';
        cargarRutinas(idCliente);
    }
}

async function cargarEjerciciosRutina(idRutina) {
    const contenedor = document.getElementById(`ejercicios-rutina-${idRutina}`);
    if (!contenedor) return;

    const data = await api(`php/ejercicios.php?accion=listar&idRutina=${encodeURIComponent(idRutina)}`);

    if (!data.ok) {
        contenedor.innerHTML = `<p>${escapar(data.message)}</p>`;
        return;
    }

    contenedor.innerHTML = data.data.length
        ? data.data.map((item) => `
            <div class="ejercicio-chip">
                <strong>${escapar(item.ejercicio)}</strong>
                <span>${item.series}x${item.reps} · ${item.peso} kg</span>
            </div>
        `).join('')
        : '<p class="muted">Sin ejercicios todavía.</p>';
}

async function verEvolucionCliente(id) {
    const cliente = clientesCache.find((item) => item.id === id);

    document.getElementById('contenido').innerHTML = `
        <div class="dashboard-header">
            <div class="brand-heading">
                <img class="brand-mark" src="img/logo-devioz.png" alt="Logo Devioz">
                <div>
                    <h1 class="titulo-dashboard">Evolución de ${escapar(cliente?.nombre || 'cliente')}</h1>
                    <p class="subtitulo">Seguimiento semanal de rutinas, ejercicios y volumen trabajado</p>
                </div>
            </div>
            <div class="acciones-header">
                <button class="accion accion-secundaria" onclick="verRutinas(${id})">Rutinas</button>
                <button class="accion accion-secundaria" onclick="clientes()">Volver a clientes</button>
            </div>
        </div>

        <div class="top-dashboard">
            <div class="kpi"><h3>Semanas</h3><p id="evoSemanas">0</p></div>
            <div class="kpi"><h3>Rutinas</h3><p id="evoRutinas">0</p></div>
            <div class="kpi"><h3>Ejercicios</h3><p id="evoEjercicios">0</p></div>
            <div class="kpi"><h3>Repeticiones</h3><p id="evoReps">0</p></div>
            <div class="kpi"><h3>Volumen kg</h3><p id="evoVolumen">0</p></div>
        </div>

        <div class="charts-grid evolucion-grid">
            <div class="chart-card"><h2>Rutinas por semana</h2><canvas id="graficoRutinasCliente"></canvas></div>
            <div class="chart-card"><h2>Volumen semanal</h2><canvas id="graficoVolumenCliente"></canvas></div>
        </div>

        <div class="card">
            <h2>Detalle semanal</h2>
            <div id="tablaEvolucionCliente">Cargando...</div>
        </div>
    `;

    await cargarEvolucionCliente(id);
}

async function cargarEvolucionCliente(idCliente) {
    const data = await api(`php/rutinas.php?accion=evolucionCliente&idCliente=${encodeURIComponent(idCliente)}`);

    if (!data.ok) {
        document.getElementById('tablaEvolucionCliente').innerHTML = `<p>${escapar(data.message)}</p>`;
        return;
    }

    const filas = data.data;
    const totalRutinas = sumar(filas.map((fila) => fila.rutinas));
    const totalEjercicios = sumar(filas.map((fila) => fila.ejercicios));
    const totalReps = sumar(filas.map((fila) => fila.repeticiones));
    const totalVolumen = sumar(filas.map((fila) => Number(fila.volumen)));

    document.getElementById('evoSemanas').innerText = filas.length;
    document.getElementById('evoRutinas').innerText = totalRutinas;
    document.getElementById('evoEjercicios').innerText = totalEjercicios;
    document.getElementById('evoReps').innerText = totalReps;
    document.getElementById('evoVolumen').innerText = Number(totalVolumen).toLocaleString('es-PE');

    document.getElementById('tablaEvolucionCliente').innerHTML = filas.length
        ? `
            <table>
                <thead>
                    <tr>
                        <th>Semana</th>
                        <th>Rutinas</th>
                        <th>Ejercicios</th>
                        <th>Repeticiones</th>
                        <th>Volumen kg</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas.map((fila) => `
                        <tr>
                            <td>${escapar(fila.semana)}</td>
                            <td>${fila.rutinas}</td>
                            <td>${fila.ejercicios}</td>
                            <td>${fila.repeticiones}</td>
                            <td>${Number(fila.volumen).toLocaleString('es-PE')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        : '<p>No hay rutinas suficientes para mostrar evolución.</p>';

    crearGraficosEvolucion(filas);
}

function crearGraficosEvolucion(filas) {
    clienteCharts.forEach((chart) => chart.destroy());
    clienteCharts = [];

    const labels = filas.map((fila) => fila.semana);
    const opciones = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#334155', font: { family: 'Arial' } } },
        },
        scales: {
            x: { ticks: { color: '#334155', font: { family: 'Arial' } } },
            y: { beginAtZero: true, ticks: { color: '#334155', font: { family: 'Arial' } } },
        },
    };

    clienteCharts.push(new Chart(document.getElementById('graficoRutinasCliente'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Rutinas',
                    data: filas.map((fila) => fila.rutinas),
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, .18)',
                    fill: true,
                    tension: .35,
                },
                {
                    label: 'Ejercicios',
                    data: filas.map((fila) => fila.ejercicios),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, .14)',
                    fill: true,
                    tension: .35,
                },
            ],
        },
        options: opciones,
    }));

    clienteCharts.push(new Chart(document.getElementById('graficoVolumenCliente'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Volumen kg', data: filas.map((fila) => fila.volumen), backgroundColor: '#0f766e', borderRadius: 10 }],
        },
        options: opciones,
    }));
}
