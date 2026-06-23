document.addEventListener("DOMContentLoaded", () => {
    const btnAgregarContacto = document.getElementById("btn-agregar-contacto");
    const btnEnviarDinero = document.getElementById("btn-enviar-dinero");

    // 1. Abrir el formulario emergente para nuevos contactos
    if (btnAgregarContacto) {
        btnAgregarContacto.addEventListener("click", () => {
            alert("Abriendo formulario para añadir nuevo contacto.");
        });
    }

    // 2. Enviar Dinero, validar campos y restar del saldo global
    if (btnEnviarDinero) {
        btnEnviarDinero.addEventListener("click", (e) => {
            e.preventDefault();
            
            const inputMonto = document.getElementById("monto-envio");
            const montoEnvio = parseInt(inputMonto.value);
            let saldoActual = parseInt(localStorage.getItem("saldoWallet")) || 50000;

            // Validaciones obligatorias
            if (isNaN(montoEnvio) || montoEnvio <= 0) {
                alert("Por favor, introduce un monto válido.");
                return;
            }
            if (montoEnvio > saldoActual) {
                alert("Error: Fondos insuficientes para realizar esta transacción.");
                return;
            }

            // Descontar saldo y guardar el nuevo monto
            let nuevoSaldo = saldoActual - montoEnvio;
            localStorage.setItem("saldoWallet", nuevoSaldo);

            // Registrar la transacción restando en el historial
            let movimientos = JSON.parse(localStorage.getItem("movimientosWallet")) || [];
            movimientos.unshift({
                fecha: new Date().toLocaleDateString('es-CL'),
                detalle: "Envío de Dinero",
                monto: `- $${montoEnvio.toLocaleString('es-CL')}`
            });
            localStorage.setItem("movimientosWallet", JSON.stringify(movimientos));

            alert(`¡Transacción confirmada! Has enviado con éxito el dinero. Redirigiendo al menú...`);
            window.location.href = "menu.html";
        });
    }
});