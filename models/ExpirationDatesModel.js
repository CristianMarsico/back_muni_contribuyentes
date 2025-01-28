"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Servicio para obtener todas las fechas de vencimiento.
 * 
 * Esta función realiza una consulta SQL para obtener todas las fechas de vencimiento almacenadas en la base de datos. 
 * Devuelve los resultados de la consulta, que incluyen el día, mes y año extraídos de la fecha de vencimiento. 
 * Si ocurre un error en la consulta, se lanza una excepción.
 * 
 * @returns {Array} - Una lista de objetos que contienen el `id_vencimiento`, `dia`, `mes` y `anio` de las fechas de vencimiento. 
 *                    Si no hay fechas, se devuelve una lista vacía.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanza un error con un mensaje descriptivo.
 * 
 * @example
 * // Ejemplo de uso:
 * getAll()
 *   .then(result => {
 *     console.log(result); // Devuelve las fechas de vencimiento con sus respectivos días, meses y años
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_vencimiento, extract(DAY from (fecha_vencimiento)) as dia, extract(MONTH from (fecha_vencimiento)) as mes, extract(YEAR from (fecha_vencimiento)) as anio FROM fecha_vencimiento ORDER BY id_vencimiento';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener las fechas' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Servicio para actualizar la fecha de vencimiento en la base de datos.
 * 
 * Esta función realiza una consulta SQL para actualizar la fecha de vencimiento en la base de datos. 
 * Devuelve el resultado de la operación de actualización. Si ocurre un error, se lanza una excepción.
 * 
 * @param {number} id - El id de la fecha de vencimiento a actualizar.
 * @param {string} date - La nueva fecha de vencimiento a establecer.
 * 
 * @returns {Object} - El objeto de resultado de la consulta, que contiene detalles sobre la actualización realizada.
 * 
 * @throws {Error} - Si ocurre un error durante la actualización de la base de datos, se lanza una excepción con el mensaje "Error en la base de datos".
 * 
 * @example
 * // Ejemplo de uso:
 * updateExipirationDate(id, date)
 *   .then(result => {
 *     console.log(result); // Devuelve el resultado de la actualización
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.updateExipirationDate = async (id, date) => {
    const query = `
        UPDATE fecha_vencimiento
        SET fecha_vencimiento = $1
        WHERE id_vencimiento = $2
        ;
    `;
    const values = [date, id];

    try {
        const result = await conn.query(query, values);      
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};
