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
// ESCANER QR (VERSIÓN PRO)
// =============================

let html5QrCode = null;

// INICIAR ESCANEO
document.getElementById("startScanBtn").addEventListener("click", async function () {

    if (!html5QrCode) {

        html5QrCode = new Html5Qrcode("reader");

        try {
            const cameras = await Html5Qrcode.getCameras();

            if (cameras && cameras.length) {

                await html5QrCode.start(
                    cameras[0].id,
                    {
                        fps: 10,
                        qrbox: 250
                    },
                    async (decodedText) => {

                        console.log("QR detectado:", decodedText);

                        await html5QrCode.stop();
                        html5QrCode = null;

                        validarCodigo(decodedText);
                    }
                );
            }
        } catch (err) {
            console.error("Error al iniciar cámara:", err);
        }
    }
});


// DETENER ESCANEO
document.getElementById("stopScanBtn").addEventListener("click", async function () {

    if (html5QrCode) {

        try {

            const state = html5QrCode.getState();

            if (state === Html5QrcodeScannerState.SCANNING ||
                state === Html5QrcodeScannerState.PAUSED) {

                await html5QrCode.stop();
                await html5QrCode.clear();
                html5QrCode = null;

                document.getElementById("resultado").innerText =
                    "Escaneo detenido";

            }

        } catch (err) {
            console.error("Error al detener:", err);
        }
    }
});


// =============================
// VALIDAR CON BACKEND
// =============================

function validarCodigo(codigo) {

    fetch("https://nonmodal-abandonable-vanesa.ngrok-free.dev/api/validar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ codigo: codigo })
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("resultado").innerHTML = `
            <strong>Código escaneado:</strong> ${codigo} <br>
            <strong>Respuesta servidor:</strong> ${data}
        `;
    })
    .catch(error => {
        console.error(error);
        document.getElementById("resultado").innerText =
            "Error al validar el código";
    });
}