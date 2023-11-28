const db = require('../database.js');

const buscarCliente = async (dni, exacto) => {
    const conn = await db.getConn();
    conn.input('dni', db.sql.NVarChar, dni);
    conn.input('exacto', db.sql.TinyInt, exacto);
    return conn.execute("buscarClientesDniPOS");
}

const buscarPersonal = async (dni) => {
    const conn = await db.getConn();
    const query = `SELECT TOP 1 * FROM Personal WHERE NroDoc=@dni AND Habilitado=1 AND Activo=1`;
    conn.input('dni', db.sql.VarChar, dni);
    return conn.query(query);
}

module.exports = {
    buscarCliente,
    buscarPersonal
};