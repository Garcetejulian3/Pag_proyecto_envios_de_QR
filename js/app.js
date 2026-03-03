const form = document.getElementById("formId");

form.addEventListener("submit", consumirApi);

async function consumirApi(event) {
    event.preventDefault();

    const mensajeId = document.getElementById("mensajeId").value;
    const emailId = document.getElementById("emailId").value;
    const codigoId = document.getElementById("codigoId").value;
    
    if(!mensajeId || !emailId || !codigoId) {
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
        console.error("Error al enviar el mensaje:", error);
        alert("Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.");
    }
}