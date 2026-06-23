document.addEventListener("DOMContentLoaded", () => {
    const contenedorLista = document.getElementById("lista-movimientos");
    // Trae las operaciones guardadas en memoria
    const movimientos = JSON.parse(localStorage.getItem("movimientosWallet")) || [];

    if (contenedorLista) {
        // Si no hay datos registrados todavía
        if (movimientos.length === 0) {
            contenedorLista.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Aún no registras movimientos comerciales.</td></tr>`;
            return;
        }

        // Limpiamos contenido de prueba estático y dibujamos los de verdad
        contenedorLista.innerHTML = ""; 
        
        movimientos.forEach(op => {
            const fila = document.createElement("tr");
            // Ponemos verde si es depósito (+), o rojo si es envío (-)
            const colorMonto = op.monto.includes("+") ? "text-success" : "text-danger";

            fila.innerHTML = `
                <td>${op.fecha}</td>
                <td>${op.detalle}</td>
                <td class="${colorMonto} fw-bold">${op.monto}</td>
            `;
            contenedorLista.appendChild(fila);
        });
    }
});