"use strict";
const { conn } = require('../dataBase/Connection.js');

/**
 * Modelo para agregar una nueva notificación en la base de datos.
 * 
 * @async
 * @function
 * @param {boolean} leida - Estado de lectura de la notificación.
 * @param {string} fecha - Fecha de la notificación (formato ISO).
 * @param {string} cuit - CUIT del contribuyente.
 * @param {number} monto - Monto relacionado a la notificación.
 * @param {string} codigo_comercio - Código del comercio asociado.
 * @param {string} mes - Mes al que corresponde la notificación.
 * 
 * @returns {Object} Objeto de la notificación insertada.
 * @throws {Error} Error al insertar la notificación.
 */
exports.addNotificacion = async (leida, fecha, cuit, monto, codigo_comercio, mes) => {
    try {
        const notifQuery = `
            INSERT INTO notificacion (leida, fecha, cuit, monto, codigo_comercio, mes)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;        
        const result = await conn.query(notifQuery, [leida, fecha, cuit, monto, codigo_comercio, mes]);
        return result.rows[0];
    } catch (error) {       
        throw new Error('Error al agregar notificación.');
    }
};

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
exports.getAllNotifications = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM notificacion ORDER BY leida, fecha DESC';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener las notificaciones' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
};

/**
 * Servicio para actualizar el estado 'cargada_rafam' de una DDJJ a true.
 * 
 * Esta función realiza una actualización en la base de datos para cambiar el valor del campo 
 * `cargada_rafam` a `true` para la DDJJ correspondiente a los identificadores del contribuyente, 
 * comercio y fecha proporcionados.
 * 
 * @param {string} id_taxpayer - El identificador del contribuyente.
 * @param {string} id_trade - El identificador del comercio.
 * @param {string} id_date - La fecha de la DDJJ.
 * 
 * @returns {Object} - El resultado de la consulta de actualización, que contiene el número de filas afectadas.
 * 
 * @throws {Error} - Si ocurre un error durante la actualización de la base de datos, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * updateStateSendRafam(id_taxpayer, id_trade, id_date)
 *   .then(result => {
 *     console.log(result); // Resultado de la actualización
 *   })
 *   .catch(error => {
 *     console.error(error); // Manejo del error si ocurre
 *   });
 */
exports.marcarNotificacionLeida = async (id) => {
    const query = `
        UPDATE notificacion
        SET leida = true
        WHERE id_notificacion = $1;
    `;
    const values = [id];

    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};
