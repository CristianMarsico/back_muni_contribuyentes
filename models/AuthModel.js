"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Registra un nuevo contribuyente en la base de datos.
 * 
 * @async
 * @function register
 * @param {string} nombre - El nombre del contribuyente.
 * @param {string} apellido - El apellido del contribuyente.
 * @param {string} cuit - El número de CUIT del contribuyente.
 * @param {string} email - El correo electrónico del contribuyente.
 * @param {string} direccion - La dirección del contribuyente.
 * @param {string} telefono - El teléfono del contribuyente.
 * @param {string} password - La contraseña del contribuyente.
 * @param {string} razon_social - La razón social del contribuyente.
 * @param {boolean} estado - El estado inicial del contribuyente.
 * @param {number} id_rol - El ID del rol asignado al contribuyente.
 * @returns {Object} El nuevo contribuyente registrado con todos sus datos.
 * @throws {Error} Si ocurre un error al registrar el contribuyente.
 */
exports.register = async (nombre, apellido, cuit, email, direccion, telefono, password, razon_social, estado, id_rol) => {
    try {
        const query = `
      INSERT INTO contribuyente (nombre, apellido, cuit, email, direccion, telefono, password, razon_social, estado, id_rol)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id_contribuyente, nombre, apellido, cuit, email, direccion, telefono, razon_social, estado, id_rol
    `;
        const result = await conn.query(query, [nombre, apellido, cuit, email, direccion, telefono, password, razon_social, estado, id_rol]);
        return result.rows[0]; // Devuelve todos los datos del contribuyente
    } catch (error) {      
        throw new Error('Error al registrar contribuyente.');
    }
};


/**
 * Obtiene un usuario y su rol a partir del nombre de usuario.
 * @function
 * @async
 * @param {string} usuario - El nombre de usuario del administrador.
 * @returns {Array} - Devuelve un array con los datos del usuario y su rol.
 * @throws {Error} - Si hay un error al consultar la base de datos.
 */
exports.getUserWithRole = async (usuario) => {    
    return new Promise((resolve, reject) => {
        const sql = `SELECT u.id_usuario, u.usuario, u.password, u.id_rol, r.rol
                 FROM usuario u
                 INNER JOIN rol r ON u.id_rol = r.id_rol
                 WHERE u.usuario = $1`;
        conn.query(sql, [usuario], (err, resultados) => {           
            if (err) return reject({ status: 500, message: 'Error al obtener el usuario' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve las filas si hay resultados
            resolve([]);
        });
    });
};

/**
 * Obtiene un contribuyente y su rol a partir del CUIT.
 * @function
 * @async
 * @param {number} cuit - El CUIT del contribuyente.
 * @returns {Array} - Devuelve un array con los datos del contribuyente y su rol.
 * @throws {Error} - Si hay un error al consultar la base de datos.
 */
exports.getTaxpayerWithRole = async (cuit) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT c.id_contribuyente, c.nombre, c.apellido, c.cuit, c.password, c.id_rol, c.estado, r.rol
                 FROM contribuyente c
                 INNER JOIN rol r ON c.id_rol = r.id_rol
                 WHERE c.cuit = $1`;
        conn.query(sql, [cuit], (err, resultados) => {            
            if (err) return reject({ status: 500, message: 'Error al obtener el contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve las filas si hay resultados
            resolve([]);
        });
    });
};


exports.saveResetCode = async (email, code) => {
    try {
        const query = `
            UPDATE contribuyente
            SET reset_code = $1, reset_code_expiration = NOW() + INTERVAL '10 minutes'
            WHERE email = $2
        `;
        await conn.query(query, [code, email]);
        return true;
    } catch (error) {
        return false;
    }
};

exports.verifyResetCode = async(email, code) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
                    FROM contribuyente
                    WHERE email = $1 AND reset_code = $2 AND reset_code_expiration > NOW()`
            ;
        conn.query(sql, [email, code], (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los datos del usuario' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
}


exports.updatePassword = async(email, hashedPassword) => {
    const query = 'UPDATE contribuyente SET password = $1, reset_code = NULL, reset_code_expiration = NULL WHERE email = $2';
    const values = [hashedPassword, email];

    const result = await conn.query(query, values);
    return result.rows[0];
}