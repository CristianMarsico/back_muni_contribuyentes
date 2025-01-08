"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Función para registrar un nuevo contribuyente en la base de datos.
 * 
 * Esta función inserta un nuevo registro en la tabla `contribuyente` con la información proporcionada
 * y devuelve los datos del contribuyente creado.
 * 
 * @async
 * @function register
 * @param {String} nombre - Nombre del contribuyente.
 * @param {String} apellido - Apellido del contribuyente.
 * @param {Number} cuit - CUIT del contribuyente, convertido en número.
 * @param {String} email - Dirección de correo electrónico del contribuyente.
 * @param {String} direccion - Dirección del contribuyente.
 * @param {String} telefono - Número de teléfono del contribuyente.
 * @param {String} password - Contraseña encriptada del contribuyente.
 * @param {String} razon_social - Razón social asociada al contribuyente.
 * @param {Boolean} estado - Estado inicial del contribuyente (por defecto `false`).
 * @param {Number} id_rol - ID del rol asignado al contribuyente.
 * 
 * @returns {Promise<Object>} - Devuelve un objeto con los datos del contribuyente creado.
 * 
 * @throws {Error} - Lanza un error si ocurre un problema al registrar al contribuyente.
 * 
 * @example
 * // Ejemplo de uso:
 * register('Juan', 'Pérez', 20123456789, 'juan.perez@example.com', 'Calle Falsa 123', '123456789', 'hashedPassword', 'Negocio de Juan', false, 1)
 *   .then(data => console.log(data))
 *   .catch(error => console.error(error));
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
 * Función para obtener un usuario con su rol asociado.
 *
 * Esta función consulta la base de datos para recuperar información de un usuario
 * basado en su nombre de usuario, incluyendo el rol asignado.
 *
 * @function getUserWithRole
 * @param {String} usuario - Nombre del usuario a buscar.
 *
 * @returns {Promise<Array>} - Devuelve un array con los datos del usuario y su rol si existe, o un array vacío si no se encuentra.
 *
 * @throws {Error} - Si ocurre un error durante la consulta, se rechaza con un objeto que contiene el mensaje y el estado HTTP.
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
 * Función para obtener un contribuyente con su rol asociado.
 *
 * Esta función realiza una consulta en la base de datos para recuperar la información
 * de un contribuyente basado en su CUIT. También incluye el rol asociado al contribuyente.
 *
 * @function getTaxpayerWithRole
 * @param {String} cuit - CUIT del contribuyente a buscar.
 *
 * @returns {Promise<Array>} - Devuelve un array con los datos del contribuyente y su rol si existe, o un array vacío si no se encuentra.
 *
 * @throws {Error} - Si ocurre un error durante la consulta, se rechaza con un objeto de error que incluye el mensaje y el estado HTTP.
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

/**
 * Función para almacenar un código de recuperación de contraseña en la base de datos.
 * 
 * Esta función actualiza el registro del usuario con el código de recuperación y su tiempo de expiración 
 * (10 minutos desde el momento de la solicitud).
 * 
 * @function saveResetCode
 * @param {String} email - El correo electrónico del usuario al que se le asignará el código de recuperación.
 * @param {Number} code - El código de recuperación generado.
 * 
 * @returns {Promise<Boolean>} - Devuelve `true` si la actualización fue exitosa, o `false` en caso de error.
 * 
 * @example
 * // Ejemplo de uso:
 * saveResetCode("usuario@example.com", 1234).then(success => {
 *   if (success) {
 *     console.log("Código guardado correctamente.");
 *   } else {
 *     console.log("Error al guardar el código.");
 *   }
 * });
 * 
 * @throws {Error} Si ocurre un error al ejecutar la consulta en la base de datos.
 */
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

/**
 * Función para verificar un código de restablecimiento de contraseña.
 * 
 * Valida que el código proporcionado coincida con el de la base de datos y que no haya expirado.
 * 
 * @function verifyResetCode
 * @param {String} email - El correo electrónico asociado al usuario.
 * @param {Number} code - El código de restablecimiento proporcionado por el usuario.
 * 
 * @returns {Promise<Array>} - Devuelve un array con los datos del usuario si el código es válido, o un array vacío si no lo es.
 * 
 * @throws {Error} Si ocurre un error al ejecutar la consulta.
 */
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

/**
 * Función para actualizar la contraseña de un usuario en la base de datos.
 * 
 * Esta función también elimina el código de restablecimiento y su tiempo de expiración después de actualizar la contraseña.
 * 
 * @function updatePassword
 * @param {String} email - El correo electrónico asociado al usuario.
 * @param {String} hashedPassword - La nueva contraseña hasheada.
 * 
 * @returns {Promise<Object|null>} - Devuelve los datos del usuario si la actualización fue exitosa, o `null` si no lo fue.
 * 
 * @throws {Error} Si ocurre un error al ejecutar la consulta.
 */
exports.updatePassword = async(email, hashedPassword) => {
    const query = 'UPDATE contribuyente SET password = $1, reset_code = NULL, reset_code_expiration = NULL WHERE email = $2';
    const values = [hashedPassword, email];

    const result = await conn.query(query, values);
    return result.rows[0];
}