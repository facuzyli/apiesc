const PedidosDao = require('../dao/PedidosDao.js');
const SucursalesDao = require('../dao/SucursalesDao.js');

const EmailController = require('./EmailController.js');
const format = require('date-format');

async function consultaPedidoOnline(req, res) {
    const {idTienda, idSucursal, nroPedido} = req.params;
    const sucExiste = await SucursalesDao.existe(idTienda, idSucursal);
    if(sucExiste) {
        const pedido = await PedidosDao.obtener(nroPedido);
        if(pedido.recordset.length > 0){
            const resp = await Promise.all([
                SucursalesDao.obtenerPuntoRetiro(pedido.recordset[0].SucDestino),
                PedidosDao.obtenerEstado(pedido.recordset[0].ID)
            ]).then(e => {
                return {
                    pedido: pedido.recordset[0],
                    estado: e[1].recordset[0],
                    sucursal: e[0].recordset[0]
            }
            })
            res.set("Access-Control-Allow-Origin", "*")
            return res.status(200).json(resp);
        }else{
            return res.status(204).end();
        }
    }else{
        return res.status(401).end();
    }
}

async function obtenerPedidosSucursal(req, res) {
    const {idTienda, idSucursal} = req.params;
    const {fechaDesde} = req.body;
    if(isNaN(Date.parse(fechaDesde))){
        return res.status(400).json({error: "Fecha inválida"});
    }
    const fecha = format('yyyy-MM-dd hh:mm', new Date(fechaDesde));
    const sucExiste = await SucursalesDao.existe(idTienda, idSucursal);
    if(sucExiste) {
        const prom = await Promise.all([
            PedidosDao.obtenerPedidos(idTienda, idSucursal, fecha),
            PedidosDao.obtenerPedidosDetalles(idTienda, idSucursal, fecha)
        ]);
        const resp = {
            pedidos: prom[0].recordsets[0],
            detalles: prom[1].recordsets[0],
            filtroFecha: fecha
        }
        return res.status(200).json(resp);
    }else{
        return res.status(401).end();
    }
}

async function subirPedidosSucursal(req, res) {
    try{
        const {idTienda, idSucursal} = req.params;    
        const sucExiste = await SucursalesDao.existe(idTienda, idSucursal);
        if(sucExiste) {
            const {pedidos, rechazados, entregados} = req?.body;
            if(pedidos){
                for (let i = 0; i < pedidos.length; i++) {
                    const e = pedidos[i].Estados;
                    e.forEach(async (p) => {
                        const {Cantidad} = await PedidosDao.existeEstado(pedidos[i].IdNumeroPedido, p.IdEstado); 
                        if(!Cantidad){
                            PedidosDao.insertarEstado(pedidos[i].IdNumeroPedido, p.IdEstado, p.Fecha);
                        }
                    });
                }
                //setTimeout(EmailController.enviarAvisoStorePickup, 5000, {notificarRecibido: 1, IdNumeroPedido: undefined}); //por debug
            }
            if(rechazados){
                rechazados.forEach(async (p) => {
                    const pedRec = await PedidosDao.existeRechazado({
                        IdNumeroPedido: p.IdNumeroPedido,
                        IdSucursal: idSucursal
                    });
                    if(!pedRec){
                        const pRechazado = {
                            ...p,
                            IdSucursal: idSucursal
                        };
                        PedidosDao.insertarRechazado(pRechazado);
                    }
                });
            }
            if(entregados){
                entregados.forEach(async (p) => {
                    const pedEntr = await PedidosDao.existeEntregado({
                        IdNumeroPedido: p.IdNumeroPedido,
                        IdSucursal: idSucursal
                    });
                    if(!pedEntr){
                        const pEntregado = {
                            ...p,
                            IdSucursal: idSucursal
                        };
                        PedidosDao.insertarEntregado(pEntregado);
                    }
                });
            }
            return res.status(200).end();
        }else{
            return res.status(401).end();
        }
    }catch(e){
        console.log({error: e.message, fecha: (new Date).toLocaleString()})
        return res.status(500).json({error: e.message});
    }
}

module.exports = {
    consultaPedidoOnline,
    obtenerPedidosSucursal,
    subirPedidosSucursal
};