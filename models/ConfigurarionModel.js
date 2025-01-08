"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Servicio para obtener los datos de configuración de la aplicación.
 * 
 * Esta función realiza una consulta SQL para obtener la configuración de la aplicación desde la base de datos, 
 * como la fecha límite para el registro de DDJJ y la tasa actual utilizada para calcular los montos.
 * 
 * @returns {Array} - Una lista con los datos de configuración obtenidos de la base de datos o una lista vacía si no se encuentran datos.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * getAll()
 *   .then(result => {
 *     console.log(result); // Devuelve los datos de configuración
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM configuracion';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los datos de configuracion' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
};



exports.updateConfiguration = async (id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual) => {
    const query = `
        UPDATE configuracion
        SET 
            fecha_limite_ddjj = $1,
            tasa_actual = $2,
            monto_defecto = $3           
        WHERE id_configuracion = $4;
    `;
    const values = [fecha_limite_ddjj, tasa_actual,monto_ddjj_defecto, id];
    try {
        const result = await conn.query(query, values);      
        return result;               
    } catch (err) {       
        throw new Error('Error en la base de datos');
    }
};
