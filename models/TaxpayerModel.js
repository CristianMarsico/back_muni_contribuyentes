"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Servicio para obtener todos los contribuyentes de la base de datos.
 * 
 * Esta función realiza una consulta SQL para obtener todos los registros de la tabla `contribuyente` en la base de datos.
 * Si no se encuentran contribuyentes, se devuelve una lista vacía.
 * 
 * @returns {Array} - Devuelve un array con los registros de todos los contribuyentes si existen, o un array vacío si no hay registros.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanza un error con un mensaje descriptivo.
 * 
 * @example
 * // Ejemplo de uso:
 * getAll()
 *   .then(result => {
 *     console.log(result); // Devuelve los contribuyentes si existen
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contribuyente ORDER BY estado, cuit';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los contribuyentes' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Servicio para activar un contribuyente (cambiar su estado a `true`).
 * 
 * Esta función realiza una consulta SQL para actualizar el estado de un contribuyente a `true` y 
 * devuelve los datos del contribuyente actualizado. Si no se encuentra el contribuyente o hay un error 
 * en la consulta, se lanza una excepción.
 * 
 * @param {number} id - El ID del contribuyente que se desea activar.
 * 
 * @returns {Object} - Devuelve un objeto con el `id_contribuyente` y el `estado` actualizado si la operación es exitosa.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanza un error con un mensaje descriptivo.
 * 
 * @example
 * // Ejemplo de uso:
 * editActive(123)
 *   .then(result => {
 *     console.log(result); // Devuelve los datos del contribuyente actualizado
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.editActive = async (id) => {
    const query = `
        UPDATE CONTRIBUYENTE
        SET estado = true
        WHERE id_contribuyente = $1
        RETURNING id_contribuyente, estado;
    `;
    const values = [id];

    const result = await conn.query(query, values);
    return result.rows[0];
};

/**
 * Servicio para obtener los datos de un contribuyente y sus comercios asociados.
 * 
 * Esta función realiza una consulta SQL para obtener los datos del contribuyente, como nombre, apellido, email, estado, etc.,
 * junto con los comercios asociados a este contribuyente. Si no se encuentran comercios, se devuelve una lista vacía.
 * 
 * @param {number} id - El ID del contribuyente cuyo comercio se desea obtener.
 * 
 * @returns {Array} - Devuelve un array con los datos del contribuyente y los comercios si existen, o un array vacío si no hay resultados.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanza un error con un mensaje descriptivo.
 * 
 * @example
 * // Ejemplo de uso:
 * getWithTrade(123)
 *   .then(result => {
 *     console.log(result); // Devuelve los datos del contribuyente y los comercios
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getWithTrade = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT c.nombre, c.apellido, c.email, c.estado as estado_contri,  c.direccion, c.telefono, c.cuit, c.razon_social, com.id_comercio, com.cod_comercio, com.nombre_comercio, com.direccion_comercio, com.estado FROM contribuyente c JOIN comercio com USING (id_contribuyente) WHERE com.id_contribuyente = $1 ORDER BY com.cod_comercio';
        conn.query(sql, [id], (err, resultados) => {           
            if (err) return reject({ status: 500, message: 'Error al obtener los contribuyentes y sus comercios' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};