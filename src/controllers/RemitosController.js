const RemitosDao = require('../dao/RemitosDao.js');

async function subirRemitosDetallesEcommerce(req, res){
    const {idTienda, idSucursal, forzado} = req.params;
    const detalles = req.body;
    if(idSucursal && Array.isArray(detalles)){
        try{
            for (let i = 0; i < detalles.length; i++) {
                const e = detalles[i];
                const remito = await RemitosDao.obtenerRemito(e);
                 if(remito){
                    const cDet = await RemitosDao.existeDetallesRemitoEcommerce(remito.ID);
                     if(cDet.Cantidad <= 0){
                        const detInsert = {
                            IdSucursal: idSucursal,
                            IdNumeroPedido: e.IdNumeroPedido,
                            Contenedor: e.Contenedor,
                            Cantidad: e.Cantidad,
                            IdCabecera: remito.ID
                        }
                        RemitosDao.insertarRemitoDetallesEcommerce(detInsert);
                    } 
                }
            }
            return res.status(200).end();
        }catch(e){
            console.log({error: e.message, fecha: (new Date).toLocaleString()})
            return res.status(500).json({error: e.message});
        }
    }else{
        return res.status(400).end();
    }
}

module.exports = {
    subirRemitosDetallesEcommerce
}