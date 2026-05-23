// CONFIGURACIÓN: Endpoint HTTPS nativo de Render para consultar el estado de tu BD
const RENDER_DB_ENDPOINT = "https://dpg-d85k8a4vikkc73a19e00-a.oregon-postgres.render.com"; 

document.addEventListener("DOMContentLoaded", () => {
    const btnRefresh = document.getElementById("btn-refresh");
    
    // Escuchar el botón de actualización manual
    btnRefresh.addEventListener("click", fetchMetrics);

    // Carga inicial automatizada
    fetchMetrics();
});

async function fetchMetrics() {
    const statusBadge = document.getElementById("connection-status");
    const lastUpdateSpan = document.getElementById("last-update");
    const tableBody = document.getElementById("metrics-body");

    statusBadge.textContent = "Cargando...";
    statusBadge.className = "badge loading";

    try {
        // Consultamos el estado público de telemetría de la base de datos
        const response = await fetch(`${RENDER_DB_ENDPOINT}/metrics`, {
            method: 'GET'
        });

        if (!response.ok) throw new Error("Error en respuesta de servidor");

        const textData = await response.text();
        
        // Limpiamos la tabla
        tableBody.innerHTML = "";

        // Procesamos las líneas de métricas de infraestructura (conexiones, memoria, etc.)
        const lines = textData.split('\n').filter(line => line && !line.startsWith('#')).slice(0, 10);

        if(lines.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay métricas disponibles en este momento.</td></tr>`;
        } else {
            let idCounter = 1;
            lines.forEach(line => {
                const parts = line.split(' ');
                const metricName = parts[0] || 'unknown_metric';
                const metricValue = parts[1] || '0';

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${idCounter++}</td>
                    <td><strong>${metricName}</strong></td>
                    <td>${metricValue}</td>
                    <td><span style="color: #22c55e">● Activo</span></td>
                    <td>${new Date().toLocaleString()}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        // Actualizar estados visuales exitosos
        statusBadge.textContent = "En Línea";
        statusBadge.className = "badge online";
        lastUpdateSpan.textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error("Error al conectar con Render DB:", error);
        
        // Estado visual de error si falla la conexión
        statusBadge.textContent = "Desconectado";
        statusBadge.className = "badge offline";
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: #ef4444;">❌ Falló la conexión con la Capa de Datos en Render.</td></tr>`;
    }
}