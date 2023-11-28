const fs = require("fs/promises");
const path = require("path");

const LogsDao = require('../dao/LogsDao.js');
const PedidosDao = require('../dao/PedidosDao.js');
const EmailService = require('../service/EmailService.js');
const constants = require('../constants.js');

const ASUNTOS_EMAIL_ECOMMERCE = {
    "aviso_llego" : "¡Tu pedido de {{STORE}} ya está listo para retirar!",
    "entransito" : "¡Tu pedido de {{STORE}} se encuentra en tránsito!",
    "aviso_15dias" : "¡Recordá que tu pedido de {{STORE}} está listo para retirar!",
}

const ARCHIVOS_EMAIL_ECOMMERCE = {
    "aviso_llego" : "ec_storepickup_recibido.html",
    "entransito" : "ec_storepickup_entransito.html",
    "aviso_15dias" : "ec_storepickup_recordatorio.html",
}

async function enviarAvisoStorePickup({tipoEmail, IdNumeroPedido}) { 
    try {
        let result;
        let asuntoEmail = ASUNTOS_EMAIL_ECOMMERCE[tipoEmail];
        let archivo = ARCHIVOS_EMAIL_ECOMMERCE[tipoEmail];
        result = await PedidosDao.obtenerPedidosParaEmail({tipoEmail, IdNumeroPedido});
        if (result?.recordset?.length > 0) {
            let msjEmail;
            msjEmail = await fs.readFile(path.resolve(path.join(__dirname, "../", "utils", archivo)), { encoding: "utf8" });
            await enviarEmailsEcommerce({
                clientesData: result.recordset,
                asuntoEmail,
                msjEmail,
                tipo: tipoEmail
            });
            return { err: 0, message: 1 };
        }
    } catch (e) { return { err: 1, message: e } }
    return { err: 0, message: 0 };
}

async function enviarEmailsEcommerce({ clientesData, asuntoEmail, msjEmail, tipo }) {
    clientesData.forEach(async data => {
        let resp;
        try {
            const perfil = ((data.IdTienda == 1) ? "macowens" : "devre") + "-ventasonline";
            const tienda = (data.IdTienda == 1) ? "Macowens" : "Devré"
            const emailStore = EmailService.profiles[perfil].auth.user;

            let msj = msjEmail.replace("{{NOMBRE}}", data.Nombre)
            .replaceAll("{{STORE}}", tienda)
            .replace("{{URL_STORE}}", constants["URL_STORE"][data.IdTienda])
            .replace("{{URL_IMG}}", constants["STORE_URL_IMAGES"][data.IdTienda])
            .replaceAll("{{EMAIL_STORE}}", emailStore)
            .replace("{{WHATSAPP_STORE}}", constants["WHATSAPP_ECOMMERCE"][data.IdTienda])
            .replace("{{ANIO}}", (new Date()).getFullYear());

            if(tipo == "aviso_llego"){
                msj = msj.replace("{{COD}}", data.CodigoVerificador).replace("{{DIR}}", `${data.Ciudad}, ${data.Calle}`)
                .replace("{{TEL}}", data.NroCelular).replace("{{HOR_ATEN}}", data.HoraAtencion)
                .replace("{{NRO_PEDIDO}}", data.NumeroPedido)
            }
            const asunto = asuntoEmail.replace("{{STORE}}", tienda);
            
            const rEmail = await EmailService.enviarEmail({
                perfil, asunto, msj,
                emails: data.Email,
                isHtml: true,
                fromName: tienda.toUpperCase()
            });
            resp = {
                IdPedidoNumero: data.IdNumeroPedido,
                Error: 0,
                TipoAviso: tipo,
                Resultado: rEmail.response
            };
        } catch (e) {
            resp = {
                IdPedidoNumero: data.IdNumeroPedido,
                Error: 1,
                TipoAviso: tipo,
                Resultado: e.name + ': ' + e.message
            };
        }
        LogsDao.addEmailEcommerceLog(resp);
    });
}

module.exports = {
    enviarAvisoStorePickup
}