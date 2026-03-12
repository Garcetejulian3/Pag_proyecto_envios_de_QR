document.addEventListener("DOMContentLoaded", () => {

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
            const response = await fetch("https://ejemplo-email-envios-qr.onrender.com/api/send/qr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(correo)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error en backend");
            }

            const data = await response.json();

            console.log("Respuesta del backend:", data);

            alert(data.mensaje);
        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al enviar el mensaje.");
        }
    }


    // =============================
    // ESCANER QR (VERSIÓN PRO)
    // =============================

    let html5QrCode = new Html5Qrcode("reader");
    let isScanning = false;


    // =============================
    // INICIAR ESCANEO
    // =============================
    document.getElementById("startScanBtn").addEventListener("click", async () => {

        if (isScanning) return;

        try {
            const cameras = await Html5Qrcode.getCameras();

            if (!cameras.length) {
                alert("No se detectaron cámaras");
                return;
            }

            let cameraId = cameras[0].id;

            for (const camera of cameras) {
                if (camera.label.toLowerCase().includes("back") ||
                    camera.label.toLowerCase().includes("rear")) {
                    cameraId = camera.id;
                    break;
                }
            }

            await html5QrCode.start(
                cameraId,
                { fps: 10, qrbox: 250 },
                async (decodedText) => {

                    console.log("QR detectado:", decodedText);

                    await detenerEscaneo();
                    validarCodigo(decodedText);
                }
            );

            isScanning = true;

        } catch (err) {
            console.error("Error al iniciar:", err);
        }
    });


    // =============================
    // DETENER ESCANEO
    // =============================
    document.getElementById("stopScanBtn").addEventListener("click", detenerEscaneo);

    async function detenerEscaneo() {

        if (!isScanning) return;

        try {
            await html5QrCode.stop();
            await html5QrCode.clear();
            isScanning = false;
            console.log("Escaneo detenido correctamente");
        } catch (err) {
            console.error("Error al detener:", err);
        }
    }


    // =============================
    // VALIDAR CON BACKEND
    // =============================

    function validarCodigo(codigo) {

        fetch("https://ejemplo-email-envios-qr.onrender.com/api/validar", {
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

    // =============================
    // ESCANEAR DESDE GALERÍA
    // =============================

    document.getElementById("scanFileBtn").addEventListener("click", () => {
        document.getElementById("qrFileInput").click();
    });

    document.getElementById("qrFileInput").addEventListener("change", async (event) => {

        const file = event.target.files[0];
        if (!file) return;

        try {

            if (isScanning) {
                await detenerEscaneo();
            }

            const decodedText = await html5QrCode.scanFile(file, true);

            console.log("QR detectado:", decodedText);

            validarCodigo(decodedText);

        } catch (err) {

            console.error("No se detectó QR en la imagen", err);

            document.getElementById("resultado").innerText =
                "No se detectó ningún QR en la imagen.";
        }

    });

    // =============================
    // MOSTAR QR GENERADO
    // =============================

    document.getElementById("generarQRBtn").addEventListener("click", function (event) {

        event.preventDefault();

        const codigo = document.getElementById("codigoIdImg").value;

        if (!codigo) {
            alert("Ingresa un código");
            return;
        }

        const url = "https://ejemplo-email-envios-qr.onrender.com/api/qr?codigo=" + encodeURIComponent(codigo);

        const link = document.createElement("a");
        link.href = url;
        link.download = "qr_codigo.png";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    });

});