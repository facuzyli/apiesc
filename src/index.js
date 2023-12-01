const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

const EmailService = require('./service/EmailService.js');
const ClientesController = require('./controllers/ClientesController.js');
const PedidosController = require('./controllers/PedidosController.js');
const RemitosController = require('./controllers/RemitosController.js');
const EmailController = require('./controllers/EmailController.js');
const EscanerController = require('./controllers/EscanerController.js'); 



app.use(express.json());

app.get('/index.php/clientes/get/:idTienda/:idSucursal', ClientesController.buscarCliente);

app.get('/rutaParaCodigoEnvio/:codigoEnvio/:scanDateTime', EscanerController.consultarYGuardarPorCodigoEnvio);

app.get('/index.php/pedidos/consultar/:idTienda/:idSucursal/:nroPedido', PedidosController.consultaPedidoOnline);

app.put('/index.php/pedidos/:idTienda/:idSucursal/:forzado', PedidosController.obtenerPedidosSucursal);

app.post('/index.php/pedidos/:idTienda/:idSucursal/:forzado', PedidosController.subirPedidosSucursal);

app.post('/index.php/ordenesEcommerce/:idTienda/:idSucursal/:forzado', RemitosController.subirRemitosDetallesEcommerce);

app.post('/servicios/email', async (req, res) => {
    const {perfil, emails, asunto, mensaje, remitente, isHtml} = req.body;
    const html = isHtml || false;
    if(emails?.length > 0 && asunto && mensaje && perfil) {
        let resp;
        try {
            const rEmail = await EmailService.enviarEmail({perfil, emails, asunto, msj: mensaje, fromName: remitente, isHtml: html});
            resp = {
                error: 0,
                ...rEmail
            };
        } catch(e) {
            resp = {
                error: 1, 
                response: e.name + ': ' + e.message
            };
        }
        return res.status(200).json(resp);
    }else{
        return res.status(400).end();
    }
});

app.get('/servicios/ecommerce/enviarEmails', async (req, res) => {
    const {tipoEmail, IdNumeroPedido} = req.query;
    if(!tipoEmail) return res.status(400).json({error: "Se requiere el campo tipoEmail"});

    let result = await EmailController.enviarAvisoStorePickup({tipoEmail, IdNumeroPedido});
    if(result?.err) {
        const emails = ["joliva@dikter.com.ar", "pfernandez@dikter.com.ar", "soporte@dikter.com.ar"]
        const asunto = "Error - envio de avisos de Store Pickup"
        const msj = `${new Date().toLocaleString()} \n
        svr 172.16.1.235 - contenedor service-api-pos
        \n ${result.message}`
        await EmailService.enviarEmail({perfil: "alerta-sistemas", 
            emails, asunto, msj, fromName: "service-api-pos"});
        return res.status(500).json(result.message);
    } else {
        if(result?.message) return res.status(200).end();
        else res.status(204).end();
    }
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
    console.log(`connect to ${process.env.SERVER} : ${process.env.DATABASE}`)
})
  