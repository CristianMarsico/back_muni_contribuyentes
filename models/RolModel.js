"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Obtiene el ID de un rol basado en su nombre.
 * 
 * Esta función consulta la base de datos para obtener el ID del rol dado su nombre.
 * 
 * @param {String} rol - Nombre del rol a buscar (por ejemplo, 'admin').
 * 
 * @returns {Promise<Object[]>} Promesa que resuelve con un arreglo de objetos que contienen el ID del rol. 
 * Si no se encuentra el rol, devuelve un arreglo vacío.
 * 
 * @throws {Error} "Error al obtener el rol" - Si ocurre un problema durante la consulta a la base de datos.
 * 
 * @example
 * getRoleByName('admin').then(role => {
 *   console.log(role); // [{ id_rol: 1 }]
 * }).catch(error => {
 *   console.error(error); // Manejo de errores
 * });
 */
exports.getRoleByName = (rol) => {
    return new Promise((resolve, reject) => {
        const sql = `select id_rol FROM rol WHERE rol = $1`;
        conn.query(sql, [rol], (err, resultados) => { 
            if (err) return reject({ status: 500, message: 'Error al obtener el rol' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
};