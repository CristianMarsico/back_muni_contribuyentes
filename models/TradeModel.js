"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Servicio para obtener todos los comercios de la base de datos.
 * 
 * Este servicio ejecuta una consulta SQL para recuperar todos los registros de la tabla `comercio`.
 * Si se encuentran registros, devuelve la lista de comercios. Si no, devuelve una lista vacía.
 * 
 * @returns {Promise<Array>} Una lista de objetos con la información de los comercios o una lista vacía.
 * 
 * @throws {Error} Si ocurre un error en la consulta, se lanza una excepción con detalles.
 * 
 * @example
 * fetchAllTrades()
 *   .then(result => {
 *     console.log(result); // Lista de comercios
 *   })
 *   .catch(error => {
 *     console.error(error); // Manejo de errores
 *   });
 */
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM comercio';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Servicio para obtener los comercios registrados de un contribuyente desde la base de datos.
 * 
 * Este servicio realiza una consulta SQL para recuperar los comercios registrados asociados a un contribuyente.
 * Los datos incluyen el ID del comercio, código del comercio, nombre del comercio y su estado. Si no se encuentran
 * registros, devuelve una lista vacía.
 * 
 * @param {number} id - ID del contribuyente del cual se obtendrán los comercios.
 * 
 * @returns {Promise<Array>} Una lista de objetos con los datos de los comercios o una lista vacía.
 * 
 * @throws {Error} Lanza una excepción si ocurre un error durante la consulta.
 * 
 * @example
 * fetchTradesByContributor(1)
 *   .then(result => console.log(result)) // Lista de comercios
 *   .catch(error => console.error(error)); // Manejo de errores
 */
exports.get = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_comercio, cod_comercio, nombre_comercio, estado 
                    FROM comercio 
                    WHERE id_contribuyente = $1
                    ORDER BY cod_comercio`
            ;
        conn.query(sql, [id], (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

/**
 * Servicio para cambiar el estado de un comercio a "activo".
 * 
 * Esta función realiza una actualización en la base de datos para cambiar el estado de un comercio
 * a `true` (activo) usando su `id_comercio`. Si el comercio se actualiza correctamente, devuelve el ID del comercio actualizado.
 * Si no se encuentra el comercio o no se realiza el cambio, devuelve `null`.
 * 
 * @param {number} id - El ID del comercio cuyo estado debe cambiar a activo.
 * 
 * @returns {Object|null} - El objeto con el ID del comercio actualizado o `null` si no se encuentra el comercio.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanzará un error con el mensaje "Error al cambiar el estado".
 * 
 * @example
 * // Ejemplo de uso:
 * activeState(1)
 *   .then(result => {
 *     console.log(result); // Muestra el comercio actualizado o `null`
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja los errores durante la actualización
 *   });
 */
exports.activeState = async (id) => {
    const query = `
        UPDATE comercio
        SET estado = true
        WHERE id_comercio = $1
        RETURNING id_comercio;
    `;
    const values = [id];

    const result = await conn.query(query, values);
    return result.rows[0];
};

/**
 * Servicio para actualizar los datos de un comercio en la base de datos.
 * 
 * Esta función realiza una actualización en la base de datos para modificar los datos de un comercio.
 * Se actualizan el código, el nombre y la dirección del comercio según los valores proporcionados.
 * 
 * @param {string} id_trade - ID del comercio que se actualizará.
 * @param {string} id_taxpayer - ID del contribuyente al que pertenece el comercio.
 * @param {string} codigo_comercio - Nuevo código del comercio.
 * @param {string} nombre_comercio - Nuevo nombre del comercio.
 * @param {string} direccion_comercio - Nueva dirección del comercio.
 * 
 * @returns {Object} - Devuelve el ID del comercio actualizado si la operación es exitosa.
 * 
 * @throws {Error} - Si ocurre un error durante la actualización, se lanza un error.
 * 
 * @example
 * // Ejemplo de uso:
 * updateTrade(1, 12345, 'C124', 'Comercio ABC', 'Av. Ejemplo 456')
 *   .then(result => {
 *     console.log(result); // El ID del comercio actualizado
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error en caso de fallo
 *   });
 */
exports.updateTrade = async (id_trade, id_taxpayer, codigo_comercio, nombre_comercio, direccion_comercio) => {
    const query = `
        UPDATE comercio
        SET cod_comercio = $1, nombre_comercio = $2, direccion_comercio = $3
        WHERE id_comercio = $4 AND id_contribuyente = $5
        RETURNING id_comercio;
    `;
    const values = [codigo_comercio, nombre_comercio, direccion_comercio, id_trade, id_taxpayer];

    const result = await conn.query(query, values);
    return result.rows[0];
};

/**
 * Agrega los comercios asociados a un contribuyente en la base de datos.
 * 
 * @async
 * @function addTrade
 * @param {Array} misComercios - Lista de objetos que representan los comercios a agregar.
 * @param {number} id_contribuyente - El ID del contribuyente al que se asociarán los comercios.
 * @returns {boolean} `true` si los comercios fueron agregados exitosamente.
 * @throws {Error} Si ocurre un error retorna `false`.
 */
exports.addTrade = async (misComercios, id_contribuyente) => {
    try {
        const query = `
            INSERT INTO comercio (cod_comercio, nombre_comercio, direccion_comercio, estado, id_contribuyente)
            VALUES ($1, $2, $3, $4, $5)
        `;

        for (let comercios of misComercios) {
            const { codigo, nombre, direccion } = comercios;
            await conn.query(query, [codigo, nombre, direccion, false, id_contribuyente]);
        }
        return true; // Comercios agregados correctamente
    } catch (error) {
        return false;
    }
};

/**
 * Servicio para registrar un nuevo comercio en la base de datos.
 * 
 * Esta función realiza una inserción en la base de datos para agregar un nuevo comercio. 
 * El estado del comercio se establece como `false` de manera predeterminada.
 * 
 * @param {number} id_contribuyente - El ID del contribuyente al que se asociará el comercio.
 * @param {string} cod_comercio - El código del nuevo comercio.
 * @param {string} nombre_comercio - El nombre del nuevo comercio.
 * @param {string} direccion_comercio - La dirección del nuevo comercio.
 * 
 * @returns {boolean} - Devuelve `true` si el comercio se ha agregado correctamente, 
 *                      o `false` si ocurrió un error al intentar agregar el comercio.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanza un error.
 * 
 * @example
 * // Ejemplo de uso:
 * newTrade(1, 'C123', 'Comercio XYZ', 'Av. Ficticia 123')
 *   .then(result => {
 *     console.log(result); // true si se agregó correctamente
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja el error en caso de fallo
 *   });
 */
exports.newTrade = async (id_contribuyente, cod_comercio, nombre_comercio, direccion_comercio,) => {
    try {
        const query = `
            INSERT INTO comercio (cod_comercio, nombre_comercio, direccion_comercio, estado, id_contribuyente)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await conn.query(query, [cod_comercio, nombre_comercio, direccion_comercio, false, id_contribuyente]);
        return true; // Comercios agregados correctamente
    } catch (error) {
        return false;
    }
};

/**
 * Servicio para cambiar el estado de un comercio a "inactivo".
 * 
 * Esta función realiza una actualización en la base de datos para cambiar el estado de un comercio
 * a `false` usando su `id_comercio`. Si el comercio se actualiza correctamente, devuelve el ID del comercio actualizado.
 * Si no se encuentra el comercio o no se realiza el cambio, devuelve `null`.
 * 
 * @param {number} id - El ID del comercio cuyo estado debe cambiar a activo.
 * 
 * @returns {Object|null} - El objeto con el ID del comercio actualizado o `null` si no se encuentra el comercio.
 * 
 * @throws {Error} - Si ocurre un error durante la consulta SQL, se lanzará un error con el mensaje "Error al cambiar el estado".
 * 
 * @example
 * // Ejemplo de uso:
 * activeState(1)
 *   .then(result => {
 *     console.log(result); // Muestra el comercio actualizado o `null`
 *   })
 *   .catch(error => {
 *     console.error(error); // Maneja los errores durante la actualización
 *   });
 */
exports.disabledState = async (id) => {
    const query = `
        UPDATE comercio
        SET estado = false
        WHERE id_comercio = $1
        RETURNING id_comercio;
    `;
    const values = [id];

    const result = await conn.query(query, values);
    return result.rows[0];
};