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