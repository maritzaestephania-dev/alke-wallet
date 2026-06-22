$(document).ready(function () {
    // 1. Persistencia y simulación de base de datos en LocalStorage
    if (localStorage.getItem("saldo") === null) {
        localStorage.setItem("saldo", "150000"); // Saldo por defecto de prueba
    }
    if (localStorage.getItem("contactos") === null) {
        let iniciales = ["Juan Pérez", "María Lyon", "Carlos Silva", "Ana Edwards"];
        localStorage.setItem("contactos", JSON.stringify(iniciales));
    }
    if (localStorage.getItem("transacciones") === null) {
        let defaultTrans = [
            { fecha: new Date().toLocaleString(), detalle: "Apertura de billetera digital", tipo: "Depósito", monto: 150000 }
        ];
        localStorage.setItem("transacciones", JSON.stringify(defaultTrans));
    }

    // Funciones globales de acceso y formato de dinero
    function getSaldo() { return parseFloat(localStorage.getItem("saldo")); }
    function setSaldo(val) { localStorage.setItem("saldo", val.toFixed(2)); }
    function formatMoney(num) {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(num);
    }

    // Renderizado automático de los elementos de visualización de fondos
    $("#displaySaldo").text(formatMoney(getSaldo()));
    $("#depositCurrentSaldo").text(formatMoney(getSaldo()));
    $("#sendCurrentSaldo").text(formatMoney(getSaldo()));

    // 2. Control de Inicio de Sesión (login.html)
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();
        let email = $("#email").val().trim();
        let password = $("#password").val();

        // Validación segura requerida por consigna
        if (email === "user@alke.com" && password === "123456") {
            localStorage.setItem("sessionUser", "Alke User");
            window.location.href = "menu.html";
        } else {
            $("#loginAlert").removeClass("d-none");
        }
    });

    if ($("#userName").length > 0) {
        let activeUser = localStorage.getItem("sessionUser") || "Usuario Invitado";
        $("#userName").text(activeUser);
    }

    $("#logoutBtn").on("click", function() {
        localStorage.removeItem("sessionUser");
    });

    // 3. Control de Depósitos de Fondos (deposit.html)
    $("#depositForm").on("submit", function (e) {
        e.preventDefault();
        let amount = parseFloat($("#amount").val());

        if (amount > 0) {
            let nuevoSaldo = getSaldo() + amount;
            setSaldo(nuevoSaldo);

            // Registro en historial
            let transacciones = JSON.parse(localStorage.getItem("transacciones"));
            transacciones.unshift({
                fecha: new Date().toLocaleString(),
                detalle: "Abono de Fondos por Ventanilla",
                tipo: "Depósito",
                monto: amount
            });
            localStorage.setItem("transacciones", JSON.stringify(transacciones));

            // Actualización dinámica con jQuery y visualización en Modal
            $("#depositCurrentSaldo").text(formatMoney(nuevoSaldo));
            $("#amount").val("");
            $("#modalMessage").text(`Has depositado con éxito un monto de ${formatMoney(amount)}.`);
            
            let myModal = new bootstrap.Modal(document.getElementById('successModal'));
            myModal.show();
        }
    });

    // 4. Módulo de Transferencias y Contactos (sendmoney.html)
    function renderContactos() {
        if ($("#contactsList").length === 0) return;
        let contactos = JSON.parse(localStorage.getItem("contactos"));
        $("#contactsList").empty();
        contactos.forEach(function(c) {
            $("#contactsList").append(`<li class="list-group-item d-flex justify-content-between align-items-center py-2">${c} <span class="badge bg-light text-secondary border">Contacto Guardado</span></li>`);
        });
    }
    renderContactos();

    // Evento de guardado de nuevo contacto
    $("#contactForm").on("submit", function(e) {
        e.preventDefault();
        let name = $("#contactName").val().trim();
        if(name) {
            let contactos = JSON.parse(localStorage.getItem("contactos"));
            contactos.push(name);
            localStorage.setItem("contactos", JSON.stringify(contactos));
            $("#contactName").val("");
            renderContactos();
        }
    });

    // Filtro interactivo de Autocompletado (jQuery)
    $("#searchContact").on("input", function() {
        let query = $(this).val().toLowerCase();
        let listContainer = $("#autocompleteList");
        listContainer.empty();

        if(query.length === 0) {
            listContainer.addClass("d-none");
            return;
        }

        let contactos = JSON.parse(localStorage.getItem("contactos"));
        let filtrados = contactos.filter(c => c.toLowerCase().includes(query));

        if(filtrados.length > 0) {
            filtrados.forEach(function(c) {
                listContainer.append(`<div class="list-group-item list-group-item-action item-suggestion">${c}</div>`);
            });
            listContainer.removeClass("d-none");
        } else {
            listContainer.addClass("d-none");
        }
    });

    $(document).on("click", ".item-suggestion", function() {
        $("#searchContact").val($(this).text());
        $("#autocompleteList").addClass("d-none");
    });

    // Simulación del Envío de Dinero con Validaciones de Saldo
    $("#sendForm").on("submit", function(e) {
        e.preventDefault();
        let destinatario = $("#searchContact").val().trim();
        let amount = parseFloat($("#sendAmount").val());
        let saldoActual = getSaldo();

        let modalIcon = $("#sendModalIcon");
        let modalTitle = $("#sendModalTitle");
        let modalMsg = $("#sendModalMessage");

        if (amount > saldoActual) {
            modalIcon.text("❌").removeClass("text-success").addClass("text-danger");
            modalTitle.text("Fondos Insuficientes");
            modalMsg.text("Tu saldo disponible es menor al monto que intentas transferir.");
        } else {
            let nuevoSaldo = saldoActual - amount;
            setSaldo(nuevoSaldo);

            let transacciones = JSON.parse(localStorage.getItem("transacciones"));
            transacciones.unshift({
                fecha: new Date().toLocaleString(),
                detalle: `Transferencia emitida a: ${destinatario}`,
                tipo: "Transferencia",
                monto: amount
            });
            localStorage.setItem("transacciones", JSON.stringify(transacciones));

            $("#sendCurrentSaldo").text(formatMoney(nuevoSaldo));
            $("#searchContact").val("");
            $("#sendAmount").val("");

            modalIcon.text("🚀").removeClass("text-danger").addClass("text-success");
            modalTitle.text("¡Transferencia Exitosa!");
            modalMsg.text(`Se han enviado exitosamente ${formatMoney(amount)} a ${destinatario}.`);
        }

        let sendM = new bootstrap.Modal(document.getElementById('sendModal'));
        sendM.show();
    });

    // 5. Historial Dinámico de Transacciones (transactions.html)
    function renderHistorial() {
        if ($("#transactionsTableBody").length === 0) return;
        let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
        let tbody = $("#transactionsTableBody");
        tbody.empty();

        if (transacciones.length === 0) {
            tbody.append(`<tr><td colspan="4" class="text-center text-muted py-3">No hay registros de transacciones para mostrar.</td></tr>`);
            return;
        }

        transacciones.forEach(function(t) {
            let esDeposito = t.tipo === "Depósito";
            let colorClase = esDeposito ? "text-success fw-bold" : "text-danger fw-bold";
            let signo = esDeposito ? "+" : "-";

            tbody.append(`
                <tr>
                    <td class="text-muted small">${t.fecha}</td>
                    <td class="fw-semibold text-dark">${t.detalle}</td>
                    <td><span class="badge ${esDeposito ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${t.tipo}</span></td>
                    <td class="text-end ${colorClase}">${signo} ${formatMoney(t.monto)}</td>
                </tr>
            `);
        });
    }
    renderHistorial();

    $("#clearHistoryBtn").on("click", function() {
        localStorage.setItem("transacciones", JSON.stringify([]));
        renderHistorial();
    });
});