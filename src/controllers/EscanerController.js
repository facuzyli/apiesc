const EscanerDao = require('../dao/EscanerDao');
const EmailService = require('../service/EmailService');

async function consultarYGuardarPorCodigoEnvio(req, res) {
    const { codigoEnvio, scanDateTime } = req.params;

    try {
        // Obtener datos del local y depósito
        const datos = await EscanerDao.obtenerDatosPorCodigoEnvio(codigoEnvio);

        // Guardar datos en la base de datos junto con scanDateTime
        await EscanerDao.guardarDatos(codigoEnvio, scanDateTime, datos);

        // Preparar y enviar correo electrónico
        const asunto = 'Información de Envío';
        const mensaje = `Código de Envío: ${codigoEnvio}\nFecha y Hora del Escaneo: ${scanDateTime}\nLocal: ${datos.local}\nDepósito: ${datos.deposito}`;
        await EmailService.enviarEmail({
            perfil: 'perfilDeCorreo',
            emails: 'destinatario@example.com',
            asunto,
            msj: mensaje,
            isHtml: false
        });

        res.json({ message: 'Datos guardados y correo enviado' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
}

module.exports = {
    consultarYGuardarPorCodigoEnvio
};