"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Servicio para obtener los datos de configuración de la aplicación.
 * 
 * Esta función realiza una consulta SQL para obtener la configuración de la aplicación desde la base de datos, 
 * como la fecha límite para el registro de DDJJ y la tasa actual utilizada para calcular los montos.
 * 
 * @returns {Array} - Una lista con los datos de configuración obtenidos de la base de datos o una lista vacía si no se encuentran datos.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * getAll()
 *   .then(result => {
 *     console.log(result); // Devuelve los datos de configuración
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getAllConfig = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM configuracion';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los datos de configuracion' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
};

/**
 * Servicio para actualizar la configuración en la base de datos.
 * 
 * Este servicio realiza una consulta SQL para actualizar los parámetros de configuración 
 * en la base de datos según el ID de la configuración proporcionado.
 * 
 * @param {number} id - ID de la configuración que se actualizará.
 * @param {number} fecha_limite_ddjj - Fecha límite para la declaración jurada.
 * @param {number} monto_ddjj_defecto - Monto por defecto de la declaración jurada.
 * @param {number} tasa_actual - Tasa de la configuración.
 * 
 * @returns {Object} - El resultado de la operación de actualización.
 * 
 * @throws {Error} Lanza una excepción si ocurre un error durante la consulta.
 * 
 * @example
 * updateConfiguration(1, 31, 1000, 0.2)
 *   .then(result => console.log(result)) // Resultado de la actualización
 *   .catch(error => console.error(error)); // Manejo de errores
 */
exports.updateConfigurationValues = async (id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, porcentaje_buen_contribuyente) => {
    const query = `
        UPDATE configuracion
        SET 
            fecha_limite_ddjj = $1,
            tasa_actual = $2,
            monto_defecto = $3,
            porcentaje_buen_contribuyente = $4
        WHERE id_configuracion = $5;
    `;
    const values = [fecha_limite_ddjj, tasa_actual, monto_ddjj_defecto, porcentaje_buen_contribuyente, id];
    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};

/**
 * Servicio para actualizar la configuración en la base de datos.
 * 
 * Este servicio realiza una consulta SQL para actualizar los parámetros de configuración 
 * en la base de datos según el ID de la configuración proporcionado.
 * 
 * @param {number} id - ID de la configuración que se actualizará.
 * @param {number} whatsapp - Número de whatsapp.
 * @param {string} email - Email del municipio.
 * @param {number} telefono - Teléfono fijo.
 * @param {string} direccion - Dirección de oficina.
 * 
 * @returns {Object} - El resultado de la operación de actualización.
 * 
 * @throws {Error} Lanza una excepción si ocurre un error durante la consulta.
 * 
 * @example
 * updateConfigurationInfo(2262556556, example@gmial.com, 2262343434, Italia 64)
 *   .then(result => console.log(result)) // Resultado de la actualización
 *   .catch(error => console.error(error)); // Manejo de errores
 */
exports.updateConfigurationInfo = async (id, whatsapp, email, telefono, direccion, facebook, instagram) => {
    const query = `
        UPDATE configuracion
        SET 
            whatsapp = $1,
            email = $2,
            telefono = $3,
            direccion = $4,
            facebook = $5,
            instagram = $6      
        WHERE id_configuracion = $7;
    `;
    const values = [whatsapp, email, telefono, direccion, facebook, instagram, id];
    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};