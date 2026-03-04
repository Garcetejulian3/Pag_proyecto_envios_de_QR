// =============================
// FORMULARIO ENVÍO EMAIL
// =============================

const form = document.getElementById("formId");

form.addEventListener("submit", consumirApi);

async function consumirApi(event) {
    event.preventDefault();

    const mensajeId = document.getElementById("mensajeId").value;
    const emailId = document.getElementById("emailId").value;
    const codigoId = document.getElementById("codigoId").value;

    if (!mensajeId || !emailId || !codigoId) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const correo = {
        mensaje: mensajeId,
        email: emailId,
        codigo: codigoId
    };

    try {
        const response = await fetch("https://nonmodal-abandonable-vanesa.ngrok-free.dev/api/send/qr", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(correo)
        });

        if (!response.ok) {
            throw new Error("Error en backend");
        }

        const data = await response.json();
        console.log("Respuesta del backend:", data);
        alert("¡Mensaje enviado con éxito!");
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al enviar el mensaje.");
    }
}


// =============================
// ESCANER QR
// =============================

let html5QrcodeScanner = null;

// Iniciar escaneo
document.getElementById("startScanBtn").addEventListener("click", function () {

    if (!html5QrcodeScanner) {

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: 250 },
            false
        );

        html5QrcodeScanner.render(onScanSuccess);
    }
});

// Detener escaneo manual
document.getElementById("stopScanBtn").addEventListener("click", function () {
    detenerEscaneo();
});

// Función éxito escaneo
function onScanSuccess(decodedText, decodedResult) {

    console.log("QR detectado:", decodedText);

    detenerEscaneo();

    fetch("https://nonmodal-abandonable-vanesa.ngrok-free.dev/api/validar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ codigo: decodedText })
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("resultado").innerText = data;
    })
    .catch(error => console.error(error));
}

// Función reutilizable para detener
function detenerEscaneo() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
}