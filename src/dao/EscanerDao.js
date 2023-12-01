const db = require('../database'); 

class EscanerDao {
    
    constructor() {
        
    }

    // Método para buscar por código de envío
    async buscarPorCodigoEnvio(codigoEnvio) {
        try {
            const query = `
                SELECT IdTienda, dep_codigo 
                FROM Sucursales 
                WHERE ID IN (
                    SELECT DISTINCT IDSucursal 
                    FROM DistribucionPedidosR 
                    WHERE NumeroWMS IN (
                        SELECT DISTINCT codigo_ordenes 
                        FROM [svrblock01.dikter.com.ar].[sys_block_1.5_Macowens].dbo.Ordenes 
                        WHERE parent_id IN (
                            SELECT id_ordenes 
                            FROM [svrblock01.dikter.com.ar].[sys_block_1.5_Macowens].dbo.Ordenes 
                            WHERE codigo_ordenes = @codigoEnvio AND instancia = 1
                        )
                    )
                )`;
            const resultado = await db.query(query, [codigoEnvio]);

            // Devolver el resultado de la consulta
            return resultado;
        } catch (error) {
            console.error('Error en EscanerDao.buscarPorCodigoEnvio:', error);
            throw error;
        }
    }
    async guardarDatosEnvio(datosEnvio) {
        try {
            const query = `INSERT INTO DatosEnvio (IdTienda, DepCodigo, CodigoEnvio) VALUES (?, ?, ?)`;
            await db.query(query, [datosEnvio.idTienda, datosEnvio.depCodigo, datosEnvio.codigoEnvio]);
        } catch (error) {
            console.error('Error en EscanerDao.guardarDatosEnvio:', error);
            throw error;
        }
    }
}

// Exportar la clase para su uso en otros archivos
module.exports = new EscanerDao();