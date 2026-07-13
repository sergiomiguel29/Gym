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

        <div class="card import-card">
            <h2>Importar Clientes</h2>
            <p class="muted">Carga varios clientes desde un archivo CSV con las columnas: nombre, correo y teléfono.</p>
            <div class="import-row">
                <input type="file" id="archivoClientes" accept=".csv,text/csv">
                <button class="accion accion-inline" onclick="importarClientesMasivo()">Importar CSV</button>
                <button class="accion accion-secundaria accion-inline" onclick="descargarPlantillaClientes()">Plantilla</button>
            </div>
            <div id="resultadoImportacion" class="import-result"></div>
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

function descargarPlantillaClientes() {
    const contenido = 'nombre,correo,telefono\nJuan Pérez,juan.perez@correo.com,999111222\nMaría López,maria.lopez@correo.com,999333444\n';
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'plantilla_clientes.csv';
    enlace.click();
    URL.revokeObjectURL(url);
}

async function importarClientesMasivo() {
    const input = document.getElementById('archivoClientes');
    const resultado = document.getElementById('resultadoImportacion');

    if (!input.files.length) {
        alert('Selecciona un archivo CSV.');
        return;
    }

    const formData = new FormData();
    formData.append('archivo', input.files[0]);
    resultado.innerHTML = '<p>Importando clientes...</p>';

    const data = await api('php/importar_clientes.php', {
        method: 'POST',
        body: formData,
    });

    resultado.innerHTML = `
        <div class="${data.ok ? 'import-ok' : 'import-error'}">
            <strong>${escapar(data.message)}</strong>
            ${data.errores?.length ? `
                <ul>
                    ${data.errores.map((error) => `<li>${escapar(error)}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `;

    if (data.ok) {
        input.value = '';
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
            <div class="acciones-header">
                <button class="accion accion-secundaria" onclick="clientes()">Volver a clientes</button>
                <button class="accion accion-secundaria" onclick="verEvolucionCliente(${id})">Ver evolución</button>
            </div>
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
                <div class="form-actions-inline">
                    <button class="accion" onclick="agregarEjercicioRutina(${id})">Guardar ejercicio</button>
                    <button class="accion accion-secundaria" onclick="limpiarFormularioEjercicio()">Limpiar</button>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Rutinas guardadas</h2>
            <div class="toolbar-card">
                <button class="accion accion-inline" onclick="cargarRutinas(${id})">Actualizar lista</button>
                <button class="accion accion-secundaria accion-inline" onclick="verEvolucionCliente(${id})">Ver análisis</button>
            </div>
            <div id="rutinasCliente">Cargando...</div>
        </div>

        <div id="modalEditarEjercicio" class="modal-overlay" style="display:none;">
            <div class="modal-card modal-card-cliente">
                <div class="modal-header modal-header-green">
                    <div>
                        <h2>Editar Ejercicio</h2>
                        <p>Corrige el ejercicio sin borrar toda la rutina.</p>
                    </div>
                    <button class="modal-close" onclick="cerrarModalEjercicio()">×</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="editEjercicioId">
                    <input type="hidden" id="editEjercicioRutinaId">
                    <label>Ejercicio realizado</label>
                    <input type="text" id="editEjercicioNombre" placeholder="Ejemplo: Press banca">
                    <div class="rutina-grid-form">
                        <div>
                            <label>Series</label>
                            <input type="number" id="editEjercicioSeries" min="1">
                        </div>
                        <div>
                            <label>Reps</label>
                            <input type="number" id="editEjercicioReps" min="1">
                        </div>
                        <div>
                            <label>Peso kg</label>
                            <input type="number" id="editEjercicioPeso" min="0" step="0.5">
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="accion accion-secundaria" onclick="cerrarModalEjercicio()">Cancelar</button>
                    <button class="accion" onclick="guardarEdicionEjercicio(${id})">Guardar cambios</button>
                </div>
            </div>
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

    rutinasCache = data.data;
    const select = document.getElementById('selectRutina');
    if (select) {
        select.innerHTML = data.data.length
            ? data.data.map((rutina) => `<option value="${rutina.id}">${escapar(rutina.semana)} - ${escapar(rutina.fecha)} · rutina #${rutina.id}</option>`).join('')
            : '<option value="">Primero crea una rutina</option>';
    }

    document.getElementById('rutinasCliente').innerHTML = data.data.length
        ? data.data.map((rutina) => `
            <div class="rutina-item">
                <div class="rutina-item-head">
                    <div>
                        <strong>${escapar(rutina.semana)}</strong>
                        <span>${escapar(rutina.fecha)} · Rutina #${rutina.id}</span>
                    </div>
                    <div class="mini-actions">
                        <button onclick="seleccionarRutina(${rutina.id})">Usar</button>
                        <button onclick="editarRutina(${idCliente}, ${rutina.id})">Editar</button>
                        <button class="danger" onclick="eliminarRutina(${idCliente}, ${rutina.id})">Eliminar</button>
                    </div>
                </div>
                <div class="ejercicios-lista" id="ejercicios-rutina-${rutina.id}">Cargando ejercicios...</div>
            </div>
        `).join('')
        : '<p>No hay rutinas guardadas para este cliente.</p>';

    data.data.forEach((rutina) => cargarEjerciciosRutina(rutina.id));
}

function seleccionarRutina(idRutina) {
    const select = document.getElementById('selectRutina');
    if (select) select.value = idRutina;
    document.getElementById('ejercicioNombre')?.focus();
}

async function editarRutina(idCliente, idRutina) {
    const rutina = rutinasCache.find((item) => item.id === idRutina);
    const nuevoDia = prompt('Nuevo día de entrenamiento:', rutina?.semana || '');

    if (nuevoDia === null) return;
    if (!nuevoDia.trim()) {
        alert('El día de entrenamiento no puede estar vacío.');
        return;
    }

    const data = await api('php/rutinas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'editarRutina', idRutina, semana: nuevoDia.trim() }),
    });

    alert(data.message);
    if (data.ok) cargarRutinas(idCliente);
}

async function eliminarRutina(idCliente, idRutina) {
    if (!confirm('¿Eliminar esta rutina y todos sus ejercicios?')) return;

    const data = await api('php/rutinas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'eliminarRutina', idRutina }),
    });

    alert(data.message);
    if (data.ok) cargarRutinas(idCliente);
}

function limpiarFormularioEjercicio() {
    document.getElementById('ejercicioNombre').value = '';
    document.getElementById('ejercicioSeries').value = 3;
    document.getElementById('ejercicioReps').value = 12;
    document.getElementById('ejercicioPeso').value = 0;
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
        limpiarFormularioEjercicio();
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

    ejerciciosCache[idRutina] = data.data;

    contenedor.innerHTML = data.data.length
        ? data.data.map((item) => `
            <div class="ejercicio-chip">
                <div>
                    <strong>${escapar(item.ejercicio)}</strong>
                    <span>${item.series}x${item.reps} · ${item.peso} kg</span>
                </div>
                <div class="mini-actions">
                    <button onclick="abrirEditarEjercicio(${idRutina}, ${item.id})">Editar</button>
                    <button class="danger" onclick="eliminarEjercicio(${idRutina}, ${item.id})">Eliminar</button>
                </div>
            </div>
        `).join('')
        : '<p class="muted">Sin ejercicios todavía.</p>';
}

function abrirEditarEjercicio(idRutina, idEjercicio) {
    const ejercicio = (ejerciciosCache[idRutina] || []).find((item) => item.id === idEjercicio);

    if (!ejercicio) {
        alert('Ejercicio no encontrado.');
        return;
    }

    document.getElementById('editEjercicioId').value = ejercicio.id;
    document.getElementById('editEjercicioRutinaId').value = idRutina;
    document.getElementById('editEjercicioNombre').value = ejercicio.ejercicio;
    document.getElementById('editEjercicioSeries').value = ejercicio.series;
    document.getElementById('editEjercicioReps').value = ejercicio.reps;
    document.getElementById('editEjercicioPeso').value = ejercicio.peso;
    document.getElementById('modalEditarEjercicio').style.display = 'flex';
}

function cerrarModalEjercicio() {
    document.getElementById('modalEditarEjercicio').style.display = 'none';
}

async function guardarEdicionEjercicio(idCliente) {
    const idEjercicio = document.getElementById('editEjercicioId').value;
    const ejercicio = document.getElementById('editEjercicioNombre').value.trim();
    const series = document.getElementById('editEjercicioSeries').value;
    const reps = document.getElementById('editEjercicioReps').value;
    const peso = document.getElementById('editEjercicioPeso').value;

    if (!ejercicio || Number(series) <= 0 || Number(reps) <= 0) {
        alert('Completa ejercicio, series y repeticiones.');
        return;
    }

    const data = await api('php/ejercicios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'editar', idEjercicio, ejercicio, series, reps, peso }),
    });

    alert(data.message);
    if (data.ok) {
        cerrarModalEjercicio();
        cargarRutinas(idCliente);
    }
}

async function eliminarEjercicio(idRutina, idEjercicio) {
    if (!confirm('¿Eliminar este ejercicio?')) return;

    const data = await api('php/ejercicios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ accion: 'eliminar', idEjercicio }),
    });

    alert(data.message);
    if (data.ok) cargarEjerciciosRutina(idRutina);
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
