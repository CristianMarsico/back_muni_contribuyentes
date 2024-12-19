"use strict";
const conn = require('../dataBase/Connection.js');

"use strict";

/**
 * Obtiene todos los contribuyentes de la base de datos.
 *
 * @function getAll
 * @returns {Promise<Array>} Lista de contribuyentes.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contribuyente';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los contribuyentes' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Actualiza el estado de un contribuyente en la base de datos.
 *
 * @function editActive
 * @param {number} id - ID del contribuyente a actualizar.
 * @returns {Promise<Object>} Los datos del contribuyente actualizado.
 * @throws {Error} Si ocurre un error en la base de datos.
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
 * Obtiene un contribuyente y sus comercios asociados.
 *
 * @function getWithTrade
 * @param {number} id - ID del contribuyente.
 * @returns {Promise<Array>} Lista de comercios asociados al contribuyente.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
exports.getWithTrade = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT c.nombre, c.apellido, c.email, c.estado as estado_contri,  c.direccion, c.telefono, c.cuit, c.razon_social, com.id_comercio, com.cod_comercio, com.nombre_comercio, com.direccion_comercio, com.estado FROM contribuyente c JOIN comercio com USING (id_contribuyente) WHERE com.id_contribuyente = $1';
        conn.query(sql, [id], (err, resultados) => {           
            if (err) return reject({ status: 500, message: 'Error al obtener los contribuyentes y sus comercios' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};