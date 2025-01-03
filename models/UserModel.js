"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Registra un nuevo usuario en la base de datos.
 * 
 * @async
 * @function register
 * @param {string} nombre - El nombre del usuario.
 * @param {string} password - La contraseña del usuario.
 * @param {number} id_rol - El ID del rol asignado al usuario.
 * @returns {Object} El nuevo usuario registrado con todos sus datos.
 * @throws {Error} Si ocurre un error al registrar el usuario.
 */
exports.register = async (usuario, password, id_rol) => {
    try {
        const query = `
      INSERT INTO usuario (usuario, password, id_rol)
      VALUES ($1, $2, $3)
      RETURNING id_usuario
    `;
        const result = await conn.query(query, [usuario, password, id_rol]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error al registrar usuario.');
    }
};

exports.getAllAdmins = (id_rol) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM USUARIO WHERE id_rol = $1 ORDER BY usuario DESC`;
        conn.query(sql, [id_rol], (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los administradores' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve las filas si hay resultados
            resolve([]);  // Devuelve una lista vacía si no hay coincidencias
        });
    });
};

exports.deleteUser = (id, res) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM USUARIO WHERE id_usuario = $1 RETURNING id_usuario`;
        conn.query(sql, [id], (err, resultados) => {
            if (err) return reject(err); // Rechaza la promesa en caso de error
            // En PostgreSQL, puedes comprobar el número de filas afectadas con `rowCount`
            if (resultados.rowCount > 0) return resolve(true); // Éxito, eliminó alguna fila
            else return resolve(false); // No se encontró el análisis para eliminar         
        });
    });
};

/**
 * 
 * @function updatePass
 * @param {string} id - El ID del administrado que se desea actualizar.
 * @param {string} pass - La contraseña nueva que se desea persistir.
 * @returns {Promise} Promesa que resuelve con un objeto indicando si la actualización fue exitosa.
 * @throws {Error} Si ocurre un error al ejecutar la consulta SQL.
 */
exports.updatePass = async (id, pass) => {
    const query = `
        UPDATE USUARIO
        SET password = $1            
        WHERE id_usuario = $2;
    `;
    const values = [pass, id];
    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};