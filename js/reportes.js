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
