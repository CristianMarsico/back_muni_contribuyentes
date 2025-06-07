"use strict";
const { conn } = require('../dataBase/Connection.js');

/**
 * Modelo para registrar una nueva rectificación en la base de datos.
 * 
 * Calcula la cantidad de rectificaciones previas y agrega una nueva rectificación con el número correspondiente.
 * 
 * @async
 * @function
 * @param {number} id_contribuyente - ID del contribuyente.
 * @param {number} id_comercio - ID del comercio.
 * @param {string} fecha - Fecha de la DDJJ original.
 * @param {number} monto - Monto declarado.
 * @param {number} tasa - Tasa calculada.
 * @param {string} mes - Mes de la rectificación.
 * @param {string} fechaRectificacion - Fecha de la rectificación.
 * 
 * @returns {Object} Objeto de la rectificación insertada.
 * @throws {Error} Error al registrar la rectificación.
 */
exports.addRectificacion = async (id_contribuyente, id_comercio, fecha, monto, tasa, mes, fechaRectificacion) => {
    
    try {
        // Contar cuántas rectificaciones existen para esta DDJJ (por fecha, contribuyente y comercio)
        const countQuery = `
            SELECT COUNT(*) AS cantidad_rectificaciones
            FROM rectificacion
            WHERE id_contribuyente = $1 AND id_comercio = $2 AND fecha = $3
            GROUP BY id_contribuyente, id_comercio, fecha
        `;
        const countResult = await conn.query(countQuery, [id_contribuyente, id_comercio, fecha]);
        
        // Calcular siguiente número de rectificación
        // Si no hay resultados, empezamos desde 1 (la primera rectificación)
        const cantidadAnterior = countResult.rows.length > 0
            ? parseInt(countResult.rows[0].cantidad_rectificaciones, 10)
            : 0;

        const cantidadRectificaciones = cantidadAnterior + 1;

        // Insertar nueva rectificación
        const insertQuery = `
            INSERT INTO rectificacion (
                id_contribuyente, id_comercio, fecha, descripcion,
                monto, tasa, enviada, cantidad_rectificaciones
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const result = await conn.query(insertQuery, [
            id_contribuyente,
            id_comercio,
            fecha, // Fecha de la DDJJ original
            `Rectificado mes de ${mes}. ${fechaRectificacion}`,
            monto,
            tasa,
            false,
            cantidadRectificaciones
        ]);

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error al registrar la rectificación.');
    }
};

/**
 * Servicio para actualizar el estado 'enviada' de una rectificación a true.
 * 
 * Esta función realiza una actualización en la base de datos para cambiar el valor del campo 
 * `enviada` a `true` para la rectificación correspondiente a los identificadores de la misma, del contribuyente, 
 * comercio y fecha proporcionados.
 * 
 * @param {string} id_taxpayer - El identificador del contribuyente.
 * @param {string} id_trade - El identificador del comercio.
 * @param {string} id_date - La fecha de la DDJJ.
 * @param {string} id_rectificacion - El identificador de la rectificación.
 * 
 * @returns {Object} - El resultado de la consulta de actualización, que contiene el número de filas afectadas.
 * 
 * @throws {Error} - Si ocurre un error durante la actualización de la base de datos, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * updateStateSendRafam(id_taxpayer, id_trade, id_date, id_rectificacion)
 *   .then(result => {
 *     console.log(result); // Resultado de la actualización
 *   })
 *   .catch(error => {
 *     console.error(error); // Manejo del error si ocurre
 *   });
 */
exports.updateStateRectificar = async (id_rectificacion) => {
    const query = `
        UPDATE rectificacion
        SET enviada = true
        WHERE id_rectificacion = $1;
    `;
    const values = [id_rectificacion];

    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};
