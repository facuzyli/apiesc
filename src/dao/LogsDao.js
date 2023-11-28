const db = require('../database.js');

async function addEmailEcommerceLog({IdPedidoNumero, Error, Resultado, TipoAviso}){
    const conn = await db.getConn();
    const query = `INSERT INTO enviosEmailsEcommerceSP(IdNumeroPedido, Fecha, Error, Resultado, TipoAviso)
    SELECT @IdNumeroPedido, GETDATE(), @Error, @Resultado, @TipoAviso`;
    conn.input("IdNumeroPedido", db.sql.Int, IdPedidoNumero);
    conn.input("Error", db.sql.Bit, Error);
    conn.input("TipoAviso", db.sql.VarChar, TipoAviso);
    conn.input("Resultado", db.sql.NVarChar, Resultado);
    return conn.query(query);
};

module.exports = {
    addEmailEcommerceLog
};