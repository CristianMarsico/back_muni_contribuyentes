"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Obtiene las DDJJ de un contribuyente y comercio según el año y el mes (opcional).
 * 
 * @function getByYearTradeMonth
 * @param {string} id_taxpayer - ID del contribuyente.
 * @param {string} id_trade - ID del comercio.
 * @param {string} year - Año de la DDJJ.
 * @param {string} [month] - Mes de la DDJJ (opcional).
 * @returns {Array} - Lista de DDJJ encontradas.
 * @throws {Error} - Error si no se encuentran DDJJ o hay un error en la consulta.
 */
exports.getByYearTradeMonth = (id_taxpayer, id_trade, year, month) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT c.cuit, com.cod_comercio, d.* 
                    FROM ddjj d, contribuyente c, comercio com 
                    WHERE c.id_contribuyente = d.id_contribuyente
                        AND d.id_comercio = com.id_comercio
                        AND d.id_contribuyente = $1 
                        AND d.id_comercio = $2 
                        AND EXTRACT(YEAR FROM fecha) = $3`;
        const values = [id_taxpayer, id_trade, year];       
        
        if (month) {
            query += ' AND EXTRACT(MONTH FROM fecha) = $4';
            values.push(month);
        }       
        
        conn.query(query, values, (err, resultados) => {          
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Agrega una nueva DDJJ para un contribuyente y comercio.
 * 
 * @function addDdjj
 * @param {string} id_contribuyente - ID del contribuyente.
 * @param {string} id_comercio - ID del comercio.
 * @param {number} monto - Monto de la DDJJ.
 * @param {string} descripcion - Descripción de la DDJJ.
 * @returns {object} - Datos de la nueva DDJJ registrada.
 * @throws {Error} - Error si no se puede registrar la DDJJ.
 */
exports.addDdjj = async (id_contribuyente, id_comercio, monto, descripcion, cargada, tasa_calculada) => {
    try {
        const query = `
      INSERT INTO ddjj (id_contribuyente, id_comercio, fecha, monto, descripcion, cargada_en_tiempo, tasa_calculada)
      VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
      RETURNING id_contribuyente, id_comercio, fecha, monto, descripcion
    `;
        const result = await conn.query(query, [id_contribuyente, id_comercio, monto, descripcion, cargada, tasa_calculada]);
        return result.rows[0];
    } catch (error) {        
        throw new Error('Error al registrar la DDJJ.');
    }
};