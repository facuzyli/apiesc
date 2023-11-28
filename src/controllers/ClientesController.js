const SucursalesDao = require('../dao/SucursalesDao.js');
const ClientesDao = require('../dao/ClientesDao.js');

async function buscarCliente(req, res) {
    const {idTienda, idSucursal} = req.params;
    const {dni, exacto, personal} = req.query;
    if(!dni || dni.length <= 5 || parseInt(dni) === NaN) {
        return res.status(400).end();
    }
    const sucExiste = await SucursalesDao.existe(idTienda, idSucursal);
    if(sucExiste) {
        let resp;
        if(personal){
            resp = await ClientesDao.buscarPersonal(dni);
        }else{
            resp = await ClientesDao.buscarCliente(dni, false || exacto);
        }
        return res.status(200).json(resp.recordsets[0]);
    }else{
        return res.status(401).end();
    }
}

module.exports = {
    buscarCliente
};