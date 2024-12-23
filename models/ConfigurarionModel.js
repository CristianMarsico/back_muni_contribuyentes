"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Obtiene todas las configuraciones desde la base de datos.
 * 
 * <p>Esta función ejecuta una consulta SQL para obtener todas las configuraciones 
 * almacenadas en la base de datos y devuelve el resultado.</p>
 * 
 * @function getAll
 * @returns {Promise} Promesa que resuelve con el array de configuraciones o un array vacío si no hay configuraciones.
 * @throws {Error} Si ocurre un error al realizar la consulta a la base de datos.
 */
exports.getAll = () => {
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
 * Actualiza una configuración específica en la base de datos.
 * 
 * <p>Esta función ejecuta una consulta SQL para actualizar una configuración específica 
 * en la base de datos con los valores proporcionados.</p>
 * 
 * @function updateConfiguration
 * @param {string} id - El ID de la configuración que se desea actualizar.
 * @param {string} fecha_limite_ddjj - La nueva fecha límite para la declaración jurada.
 * @param {number} monto_ddjj_defecto - El nuevo monto de la declaración jurada por defecto.
 * @param {number} tasa_actual - La nueva tasa actual.
 * @param {number} tasa_default - La nueva tasa por defecto.
 * @returns {Promise} Promesa que resuelve con un objeto indicando si la actualización fue exitosa.
 * @throws {Error} Si ocurre un error al ejecutar la consulta SQL.
 */
exports.updateConfiguration = async (id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, tasa_default) => {
    const query = `
        UPDATE configuracion
        SET 
            fecha_limite_ddjj = $1,
            tasa_actual = $2,
            monto_defecto = $3,
            tasa_default = $4
        WHERE id_configuracion = $5;
    `;
    const values = [fecha_limite_ddjj, tasa_actual,monto_ddjj_defecto, tasa_default, id];
    try {
        const result = await conn.query(query, values);      
        return result;               
    } catch (err) {       
        throw new Error('Error en la base de datos');
    }
};
