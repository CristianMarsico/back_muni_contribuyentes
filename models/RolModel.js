"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Obtiene el ID de un rol de la base de datos basado en el nombre del rol.
 * 
 * @param {string} rol - El nombre del rol cuyo ID se desea obtener.
 * @returns {Promise} Una promesa que resuelve con el ID del rol si se encuentra, o resuelve con un arreglo vacío si no se encuentra el rol.
 * @throws {Object} Un objeto con los detalles del error si ocurre un problema con la consulta a la base de datos.
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