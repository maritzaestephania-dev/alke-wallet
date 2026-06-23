document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btn-login");
    
    // Inicializamos un saldo base si es la primera vez que se entra
    if (!localStorage.getItem("saldoWallet")) {
        localStorage.setItem("saldoWallet", "50000"); // Saldo inicial de $50.000
    }

    btnLogin.addEventListener("click", (e) => {
        e.preventDefault(); // Evita que la página se recargue
        
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validación de credenciales (puedes usar estas mismas para probar)
        if (email === "maritza@wallet.com" && password === "123456") {
            alert("¡Inicio de sesión exitoso! Redirigiendo...");
            window.location.href = "menu.html"; // Nos manda al menú
        } else {
            alert("Error: Credenciales incorrectas. Inténtalo de nuevo.");
        }
    });
});