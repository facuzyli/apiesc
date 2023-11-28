const db = require('../database.js');

async function insertarRemitoDetallesEcommerce(detalle){
    const knex = await db.getKnex();
    return knex.insert(detalle).into("MovimientosEcommerceItems");
}

async function obtenerRemito({NumeroComprobante, IdTienda, Origen, Destino, TipoComprobante}){
    const knex = await db.getKnex();
    const params = {
        NumeroComprobante,
        IdTienda,
        Origen,
        Destino,
        TipoComprobante
    }
    return knex.table("MovimientosArticulosCabeceras").where(params).first();
}

async function existeDetallesRemitoEcommerce(Id){
    const knex = await db.getKnex();
    return knex.select(knex.raw("count(*) as Cantidad")).where("IdCabecera", Id).from("MovimientosEcommerceItems").first();
}

module.exports = {
    insertarRemitoDetallesEcommerce,
    obtenerRemito,
    existeDetallesRemitoEcommerce
}