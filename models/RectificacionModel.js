"use strict";
const { conn } = require('../dataBase/Connection.js');

/**
 * Servicio para rectificar una DDJJ en la base de datos.
 * 
 * Esta función realiza una actualización en la base de datos para cambiar el monto, la tasa calculada 
 * y establecer el estado de la DDJJ como rectificada. También se incluye una descripción detallada con 
 * el mes y la fecha de rectificación.
 * 
 * @param {string} id_taxpayer - El identificador del contribuyente.
 * @param {string} id_trade - El identificador del comercio.
 * @param {string} id_date - La fecha original de la DDJJ.
 * @param {number} monto - El nuevo monto de la DDJJ.
 * @param {number} tasa - La nueva tasa calculada.
 * @param {string} mes - El mes correspondiente a la rectificación.
 * @param {string} fechaRectificacion - Fecha de rectificación en formato `YYYY-MM-DD`.
 * @param {number} diferenciaDias - Cantidad de días entre la fecha original y la fecha de rectificación.
 * 
 * @returns {Object} - Resultado de la consulta de actualización, que contiene el número de filas afectadas.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * rectificar(id_taxpayer, id_trade, id_date, monto, tasa, mes, fechaRectificacion, diferenciaDias)
 *   .then(result => console.log(result))
 *   .catch(error => console.error(error));
 */
exports.rectificar = async (id_taxpayer, id_trade, id_date, monto, tasa, mes, fechaRectificacion) => {
    const query = `
        UPDATE DDJJ
        SET monto = $1, rectificada = $2, descripcion = $3, tasa_calculada = $4, cargada_en_tiempo =$5
        WHERE id_contribuyente = $6
            AND id_comercio = $7
            AND fecha = $8
        ;
    `;
    const values = [monto, true, `Rectificado mes de ${mes}. ${fechaRectificacion}`, tasa, false, id_taxpayer, id_trade, id_date];

    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};


exports.addRectificacion = async (id_contribuyente, id_comercio, fecha, monto, tasa, mes, fechaRectificacion ) => {
    
    try {
        // Contar cuántas rectificaciones existen para esta DDJJ (por fecha, contribuyente y comercio)
        const countQuery = `
            SELECT cantidad_rectificaciones
            FROM rectificacion
            WHERE id_contribuyente = $1 AND id_comercio = $2 AND fecha = $3
            ORDER BY id_rectificacion DESC
            LIMIT 1
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
exports.updateStateRectificar = async (id_taxpayer, id_trade, id_date, id_rectificacion) => {
    const query = `
        UPDATE rectificacion
        SET enviada = true
        WHERE id_contribuyente = $1
            AND id_comercio = $2
            AND fecha = $3
            AND id_rectificacion = $4;
    `;
    const values = [id_taxpayer, id_trade, id_date, id_rectificacion];

    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};
