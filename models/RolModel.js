"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Función para obtener el ID del rol basado en su nombre.
 * 
 * Esta función consulta la base de datos para obtener el ID del rol dado su nombre. Si se encuentra el rol, devuelve su ID.
 * Si no se encuentra el rol, devuelve un arreglo vacío.
 * 
 * @param {String} rol - El nombre del rol a buscar (por ejemplo, 'admin').
 * 
 * @returns {Promise} - Devuelve una promesa que resuelve con el ID del rol o un arreglo vacío si no se encuentra el rol.
 * 
 * @example
 * // Ejemplo de uso:
 * getRoleByName('admin').then(role => {
 *   console.log(role); // Devuelve el ID del rol
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