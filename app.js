// CONFIGURACIÓN: Aquí pondrás la URL con HTTPS que te dará Render al desplegar tu Web Service de Node.js
const BACKEND_URL = "https://TU-BACKEND-DEPLOYADO.onrender.com"; 

document.addEventListener("DOMContentLoaded", () => {
    const btnRefresh = document.getElementById("btn-refresh");
    btnRefresh.addEventListener("click", fetchMetrics);
    fetchMetrics();
});

async function fetchMetrics() {
    const statusBadge = document.getElementById("connection-status");
    const lastUpdateSpan = document.getElementById("last-update");
    const tableBody = document.getElementById("metrics-body");

    statusBadge.textContent = "Cargando...";
    statusBadge.className = "badge loading";

    try {
        // El navegador se comunica de forma segura por HTTPS con tu Backend
        const response = await fetch(`${BACKEND_URL}/api/metrics`);
        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();
        tableBody.innerHTML = "";

        if(data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay registros almacenados en la tabla metricas_servidor.</td></tr>`;
        } else {
            // Renderizamos las filas con las columnas exactas de tu tabla SQL
            data.forEach(metric => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${metric.id}</td>
                    <td><strong>${metric.servidor_nombre}</strong></td>
                    <td>CPU: ${metric.uso_cpu}% | RAM: ${metric.uso_ram}%</td>
                    <td><span style="color: #22c55e">● ${metric.disco_libre} Disp.</span></td>
                    <td>${new Date(metric.fecha_registro).toLocaleString()}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        statusBadge.textContent = "En Línea";
        statusBadge.className = "badge online";
        lastUpdateSpan.textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error("Error de conexión:", error);
        statusBadge.textContent = "Desconectado";
        statusBadge.className = "badge offline";
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: #ef4444;">❌ Falló la conexión con el Backend de Render.</td></tr>`;
    }
}