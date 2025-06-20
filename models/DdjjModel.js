"use strict";
const { conn } = require('../dataBase/Connection.js');

/**
 * Servicio para obtener las DDJJ de un contribuyente y comercio por año y mes.
 * 
 * Esta función realiza una consulta SQL para obtener las DDJJ correspondientes a un contribuyente y comercio 
 * para un año y mes determinados. Si el mes está especificado, la consulta lo incluirá como filtro. Si no, 
 * solo filtra por el año. Devuelve los resultados de la consulta o una lista vacía si no hay resultados.
 * 
 * @param {number} id_taxpayer - El ID del contribuyente.
 * @param {number} id_trade - El ID del comercio.
 * @param {number} year - El año para filtrar las DDJJ.
 * @param {number} [month] - El mes para filtrar las DDJJ (opcional).
 * 
 * @returns {Array} - Una lista de las DDJJ encontradas o una lista vacía si no se encuentran resultados.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * getByYearTradeMonth(id_taxpayer, id_trade, year, month)
 *   .then(result => {
 *     console.log(result); // Devuelve las DDJJ encontradas
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getByYearTradeMonth = (id_taxpayer, id_trade, year, month) => {   
    return new Promise((resolve, reject) => {
        let query = `
            SELECT 
                d.id_contribuyente,
                d.id_comercio,
                d.fecha,
                d.monto AS monto_ddjj,
                d.descripcion AS descripcion_ddjj,
                d.cargada_en_tiempo,
                d.tasa_calculada,
                d.cargada_rafam,
                d.rectificada,
                c.cuit,
                c.es_buen_contribuyente,
                com.nombre_comercio,
                com.cod_comercio,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id_rectificacion', r.id_rectificacion,
                            'monto', r.monto,
                            'descripcion', r.descripcion,
                            'tasa', r.tasa,
                            'enviada', r.enviada,
                            'cantidad_rectificaciones', r.cantidad_rectificaciones
                        )
                    ) FILTER (WHERE r.id_rectificacion IS NOT NULL), '[]'
                ) AS rectificaciones
            FROM ddjj d
            JOIN contribuyente c ON c.id_contribuyente = d.id_contribuyente
            JOIN comercio com ON com.id_comercio = d.id_comercio
            LEFT JOIN rectificacion r 
                ON d.id_contribuyente = r.id_contribuyente 
                AND d.id_comercio = r.id_comercio 
                AND d.fecha = r.fecha
            WHERE d.id_contribuyente = $1 
              AND d.id_comercio = $2`;

        const values = [id_taxpayer, id_trade];

        if (month) {
            query += ` AND EXTRACT(YEAR FROM d.fecha) = $3 AND EXTRACT(MONTH FROM d.fecha) = $4`;
            values.push(year, month);
        } else {
            query += ` AND (
                (EXTRACT(YEAR FROM d.fecha) = $3 AND EXTRACT(MONTH FROM d.fecha) >= 2) 
                OR 
                (EXTRACT(YEAR FROM d.fecha) = $3 + 1 AND EXTRACT(MONTH FROM d.fecha) = 1)
            )`;
            values.push(year);
        }

        query += `
            GROUP BY 
                d.id_contribuyente, d.id_comercio, d.fecha, d.monto, d.descripcion,
                d.cargada_en_tiempo, d.tasa_calculada, d.cargada_rafam, d.rectificada,
                c.cuit, c.es_buen_contribuyente, com.nombre_comercio, com.cod_comercio
            ORDER BY d.fecha`;

        conn.query(query, values, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Servicio para agregar una nueva DDJJ (Declaración Jurada) a la base de datos.
 * 
 * Esta función inserta una nueva DDJJ en la base de datos con los datos proporcionados. La función utiliza 
 * la fecha actual y calcula la tasa a aplicar dependiendo de si la DDJJ se carga dentro o fuera del tiempo límite.
 * 
 * @param {number} id_contribuyente - El ID del contribuyente que presenta la DDJJ.
 * @param {number} id_comercio - El ID del comercio para el que se presenta la DDJJ.
 * @param {number} monto - El monto a declarar en la DDJJ.
 * @param {string} descripcion - La descripción de la DDJJ.
 * @param {boolean} cargada - Indica si la DDJJ fue cargada dentro del tiempo permitido.
 * @param {number} tasa_calculada - La tasa aplicada al monto declarado.
 * 
 * @returns {Object} - Los datos de la DDJJ recién agregada, incluyendo el ID del contribuyente, comercio, 
 * fecha, monto, descripción, entre otros.
 * 
 * @throws {Error} - Si ocurre un error durante la inserción de la DDJJ, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * addDdjj(id_contribuyente, id_comercio, monto, descripcion, cargada, tasa_calculada)
 *   .then(result => {
 *     console.log(result); // Devuelve los datos de la nueva DDJJ
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.addDdjj = async (id_contribuyente, id_comercio, monto, descripcion, cargada, tasa_calculada) => {
    try {
        const query = `
      INSERT INTO ddjj (id_contribuyente, id_comercio, fecha, monto, descripcion, cargada_en_tiempo, tasa_calculada, cargada_rafam, rectificada)
      VALUES ($1, $2, DATE(NOW()), $3, $4, $5, $6, false, false)
      RETURNING id_contribuyente, id_comercio, fecha, monto, descripcion
    `;
        const result = await conn.query(query, [id_contribuyente, id_comercio, monto, descripcion, cargada, tasa_calculada]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error al registrar la DDJJ.');
    }
};

/**
 * Servicio para obtener todas las DDJJ .
 * 
 * Esta función realiza una consulta SQL a la base de datos para obtener las DDJJ de contribuyentes y 
 * comercios. 
 * Los resultados se ordenan por el CUIT del contribuyente y el código del comercio.
 * 
 * @returns {Array} - Una lista de las DDJJ, 
 * o una lista vacía si no hay DDJJ.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta, se lanza un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * getAllDDJJ()
 *   .then(result => {
 *     console.log(result); // Devuelve las DDJJ
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error si ocurre
 *   });
 */
exports.getAllDDJJ = async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT 
                        d.id_contribuyente,
                        d.id_comercio,
                        d.fecha,
                        d.monto AS monto_ddjj,
                        d.descripcion AS descripcion_ddjj,
                        d.cargada_en_tiempo,
                        d.tasa_calculada,
                        d.cargada_rafam,
                        d.rectificada,
                        c.cuit,
                        c.es_buen_contribuyente,
                        com.nombre_comercio,
                        com.cod_comercio,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id_rectificacion', r.id_rectificacion,
                                    'monto', r.monto,
                                    'descripcion', r.descripcion,
                                    'tasa', r.tasa,
                                    'enviada', r.enviada,
                                    'cantidad_rectificaciones', r.cantidad_rectificaciones
                                )
                            ) FILTER (WHERE r.id_rectificacion IS NOT NULL), '[]'
                        ) AS rectificaciones
                    FROM
                        ddjj d
                    JOIN contribuyente c using (id_contribuyente)
                            join comercio com using (id_comercio)
                    LEFT JOIN
                        rectificacion r
                    ON
                        d.id_contribuyente = r.id_contribuyente AND
                        d.id_comercio = r.id_comercio AND
                        d.fecha = r.fecha
                    GROUP BY
                        d.id_contribuyente, d.id_comercio, d.fecha, d.monto, d.descripcion,
                        d.cargada_en_tiempo, d.tasa_calculada, d.cargada_rafam, d.rectificada,
                        c.cuit, c.es_buen_contribuyente, com.nombre_comercio, com.id_comercio
                    ORDER BY d.fecha;
                    `;
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener las ddjj' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
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
exports.updateStateSendRafam = async (id_taxpayer, id_trade, id_date) => {
    const query = `
        UPDATE DDJJ
        SET cargada_rafam = true
        WHERE id_contribuyente = $1
            AND id_comercio = $2
            AND fecha = $3
        ;
    `;
    const values = [id_taxpayer, id_trade, id_date];

    try {
        const result = await conn.query(query, values);
        return result;
    } catch (err) {
        throw new Error('Error en la base de datos');
    }
};

