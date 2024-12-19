"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Obtiene todos los comercios de la base de datos.
 * @function
 * @returns {Promise<Array>} Lista de comercios o un mensaje de error.
 */
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM comercio';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Obtiene los comercios asociados a un contribuyente específico.
 * @function
 * @param {string} id - ID del contribuyente.
 * @returns {Promise<Array>} Comercios asociados o un mensaje de error.
 */
exports.get = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_comercio, cod_comercio, nombre_comercio, estado FROM comercio WHERE id_contribuyente = $1';
        conn.query(sql, [id], (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Actualiza el estado de un comercio en la base de datos.
 * @function
 * @async
 * @param {string} id - ID del comercio.
 * @returns {Promise<Object>} Comercio actualizado o un mensaje de error.
 */
exports.activeState = async (id) => {
    const query = `
        UPDATE comercio
        SET estado = true
        WHERE id_comercio = $1
        RETURNING id_comercio;
    `;
    const values = [id];

    const result = await conn.query(query, values);
    return result.rows[0];
};