const db = require('../database.js');

const existe = async (idtienda, id) => {
    const redis = await db.getRedis();
    if(redis){
        const resd = await redis.get(`suc-${id}`)
        if(resd) return resd;
    }

    const conn = await db.getConn();
    const query = `SELECT 1 as existe FROM SUCURSALES WHERE ID=@id AND IdTienda=@idTienda AND Habilitado=1 AND Activo=1`;
    conn.input('id', db.sql.Int, id);
    conn.input('idTienda', db.sql.Int, idtienda);
    const res = await conn.query(query);

    if(redis){
        redis.set(`suc-${id}`, res.recordset.length);
        redis.expire(`suc-${id}`, 43200);
    }
    return res.recordset.length;
};

const obtener = async (id) => {
    const conn = await db.getConn();
    const query = `SELECT Id, IdTienda, suc_codigo, div_codigo, suc_denominacion,
    suc_direccion, suc_direccionNro, suc_codigopostal, suc_telefono, dep_codigo,
    direccion_correo, codigo_prov, codigo_localidad, Habilitado, Activo
     FROM SUCURSALES WHERE ID=@id`;
    conn.input('id', db.sql.Int, id);
    return conn.query(query);
};

const obtenerPuntoRetiro = async (idDKT) => {
    const conn = await db.getConn();
    const query = `SELECT Descripcion, Region, Ciudad, Calle, CodigoPostal, NroCelular, HoraAtencion
     FROM SucursalesSPMG WHERE idDKT=@idDKT`;
    conn.input('idDKT', db.sql.NVarChar, idDKT);
    return conn.query(query);
};

module.exports = {
    existe,
    obtener,
    obtenerPuntoRetiro
};