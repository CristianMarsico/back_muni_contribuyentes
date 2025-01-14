"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Registra un nuevo usuario en la base de datos.
 * 
 * Esta función almacena los datos de un nuevo usuario, incluyendo la contraseña encriptada y el rol asociado.
 * 
 * @param {String} usuario - Nombre del usuario a registrar.
 * @param {String} password - Contraseña encriptada del usuario.
 * @param {Number} id_rol - ID del rol asignado al usuario.
 * 
 * @returns {Object} Objeto con los datos del nuevo usuario, incluyendo su ID (`id_usuario`).
 * 
 * @throws {Error} "Error al registrar usuario." - Si ocurre un problema durante la inserción en la base de datos.
 * 
 * @example
 * register('admin', 'hashedPassword', 1)
 *   .then(user => console.log(user))
 *   .catch(error => console.error(error));
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

/**
 * Servicio para obtener todos los administradores registrados en la base de datos.
 * 
 * Esta función realiza una consulta a la base de datos para buscar a todos los usuarios con el rol de "admin". 
 * Si encuentra resultados, los devuelve como un array de objetos. 
 * Si no hay coincidencias, devuelve un array vacío.
 * 
 * @param {Number} id_rol - ID del rol correspondiente a los administradores.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con un objeto que contiene la lista de administradores o un objeto vacío si no se encuentran.
 * 
 * @throws {Object} Objeto de error con el estado HTTP y un mensaje si ocurre un problema durante la consulta.
 * 
 * @example
 * // Ejemplo de uso:
 * getAllAdmins(1)
 *   .then(admins => {
 *     console.log(admins); // Muestra la lista de administradores
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja los errores durante la consulta
 *   });
 */
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

/**
 * Servicio para eliminar un usuario de la base de datos.
 * 
 * Esta función elimina un usuario de la base de datos basado en su ID. Si la eliminación es exitosa, 
 * devuelve `true`; de lo contrario, devuelve `false` si no se encuentra el usuario para eliminar.
 * 
 * @param {Number} id - El ID del usuario a eliminar.
 * @param {Object} res - El objeto de la respuesta, utilizado para manejar los errores dentro de la función.
 * 
 * @returns {Promise<Boolean>} Una promesa que resuelve a `true` si se eliminó el usuario, 
 * o `false` si no se encontró el usuario.
 * 
 * @throws {Object} Si ocurre un error durante la consulta, la promesa se rechaza con el error.
 * 
 * @example
 * // Ejemplo de uso:
 * deleteUser(1)
 *   .then(isDeleted => {
 *     if (isDeleted) {
 *       console.log("Administrador eliminado con éxito.");
 *     } else {
 *       console.log("No se encontró el administrador para eliminar.");
 *     }
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja los errores durante la eliminación
 *   });
 */
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
 * Servicio para actualizar la contraseña de un usuario en la base de datos.
 * 
 * Esta función actualiza la contraseña de un usuario específico basado en su ID.
 * La contraseña proporcionada ya debe estar encriptada utilizando bcrypt.
 * 
 * @param {Number} id - El ID del usuario cuya contraseña se actualizará.
 * @param {String} pass - La nueva contraseña ya encriptada.
 * 
 * @returns {Object} El resultado de la consulta SQL.
 * 
 * @throws {Error} Si ocurre un error en la base de datos, se lanza una excepción.
 * 
 * @example
 * // Ejemplo de uso:
 * updatePass(1, 'hashedPassword')
 *   .then(result => {
 *     if (result.rowCount > 0) {
 *       console.log("Contraseña actualizada con éxito.");
 *     } else {
 *       console.log("No se encontró el usuario para actualizar.");
 *     }
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja los errores durante la actualización
 *   });
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