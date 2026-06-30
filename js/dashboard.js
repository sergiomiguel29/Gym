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
