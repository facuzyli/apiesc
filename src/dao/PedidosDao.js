const db = require('../database.js');

async function obtenerEstado(idPedido){
    const conn = await db.getConn();
    const query = `select a.IDNumeroPedido, a.IdEstado, de.Estado from macowens.dbo.DistribucionEstados de
    INNER JOIN (
        select MAX(IDEstado) as IdEstado, IDNumeroPedido from macowens.dbo.DistribucionPedidosEstados 
        GROUP BY IDNumeroPedido
    ) as a on a.IdEstado = de.ID
    WHERE IDNumeroPedido = @id`;
    conn.input('id', db.sql.Int, idPedido);
    return conn.query(query);
}
async function obtener(nroPedido){
    const conn = await db.getConn();
    conn.input("Numero", nroPedido);
    return conn.execute('PedidosPos_Listar');
}
async function existeEstado(IdNumeroPedido, IdEstado, Habilitado = 1){
    const knex = await db.getKnex();
    return knex.select(knex.raw("count(*) as Cantidad")).where({IdNumeroPedido, IdEstado, Habilitado}).from("macowens.dbo.DistribucionPedidosEstados").first();
}
async function insertarEstado(IdNumeroPedido, IdEstado, fecha){
    const knex = await db.getKnex();
    const data = {
        IDNumeroPedido: IdNumeroPedido,
        IDEstado: IdEstado,
        Habilitado: 1,
        FechaAlta: fecha || knex.raw("GETDATE()"),
        UsuarioAlta: "PosServiceApi",
        FechaUltimaModificacion: fecha || knex.raw("GETDATE()"),
        UsuarioUltimaModificacion: "PosServiceApi"
    }
    return knex.insert(data).into("macowens.dbo.DistribucionPedidosEstados");
}
async function obtenerPedidos(idtienda, idSucursal, fechaDesde){
    const conn = await db.getConn();
    conn.input("IdSucursal", db.sql.Int, idSucursal);
    conn.input("fechaDesde", db.sql.VarChar, fechaDesde);
    return conn.execute('PedidosPos_Listar');
}
async function obtenerPedidosDetalles(idtienda, idSucursal, fechaDesde){
    const conn = await db.getConn();
    conn.input("IdSucursal", db.sql.Int, idSucursal);
    conn.input("fechaDesde", db.sql.VarChar, fechaDesde);
    return conn.execute('PedidosDetallesPos_Listar');
}
async function obtenerPedidosParaEmail({tipoEmail, IdNumeroPedido}){
    const conn = await db.getConn();
    conn.input("tipoEmail", db.sql.VarChar, tipoEmail)
    conn.input("IdNumeroPedido", db.sql.Int, IdNumeroPedido)
    return conn.execute('PedidosPos_ListarParaEmail');
}
async function existeEntregado({IdNumeroPedido, IdSucursal}){
    const knex = await db.getKnex();
    return knex.select(knex.raw("1")).where({IdNumeroPedido, IdSucursal}).from("PedidosEcommerceSPEntregados").first();
}
async function existeRechazado({IdNumeroPedido, IdSucursal}){
    const knex = await db.getKnex();
    return knex.select(knex.raw("1")).where({IdNumeroPedido, IdSucursal}).from("PedidosEcommerceSPRechazados").first();
}
async function insertarEntregado({IdSucursal, IdNumeroPedido, Apellido, Nombre, NroDocumento}){
    const knex = await db.getKnex();
    return knex.insert({IdSucursal, IdNumeroPedido, Apellido, Nombre, NroDocumento}).into("PedidosEcommerceSPEntregados");
}
async function insertarRechazado({IdSucursal, IdNumeroPedido, Motivo}){
    const knex = await db.getKnex();
    return knex.insert({IdSucursal, IdNumeroPedido, Motivo}).into("PedidosEcommerceSPRechazados");
}

module.exports = {
    obtenerPedidos,
    obtenerPedidosDetalles,
    obtener,
    obtenerEstado,
    insertarEstado,
    existeEstado,
    obtenerPedidosParaEmail,
    existeEntregado,
    existeRechazado,
    insertarEntregado,
    insertarRechazado
}