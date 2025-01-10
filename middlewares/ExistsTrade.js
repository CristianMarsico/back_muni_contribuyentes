"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware para verificar la validez de la lista de comercios proporcionada.
 * 
 * 1. Verifica que la lista de comercios no esté vacía y sea un array válido.
 * 2. Valida que no haya códigos de comercio duplicados en la lista.
 * 3. Verifica si los códigos de comercio ya están registrados en la base de datos.
 * 
 * Si algún comercio ya está registrado, se retorna un error indicando los códigos duplicados.
 * Si la lista es válida y no hay comercios registrados previamente, se pasa al siguiente middleware.
 * 
 * @function ExistsTrade
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 * 
 * @returns {Object} Respuesta con el estado de la verificación o un error.
 */
exports.ExistsTrade = (req, res, next) => {
    const { misComercios } = req.body;

    if (!misComercios || !Array.isArray(misComercios)) {
        return res.status(404).json({ error: 'La lista de comercios no es válida' });
    }

    // Extraer los códigos de comercio de la lista de objetos
    const codigos = misComercios.map(comercio => comercio.codigo);

    // Verificar si hay códigos duplicados en la lista enviada
    const codigosDuplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);

    if (codigosDuplicados.length > 0) {
        const codigosConcatenados = [...new Set(codigosDuplicados)].join(', ');
        return res.status(404).json({
            error: `Código de comercio repetido: ${codigosConcatenados}. Quitelo de la lista.`
        });
    }

    // Consulta para verificar si alguno de los códigos ya existe en la base de datos
    const sql = `SELECT cod_comercio FROM COMERCIO WHERE cod_comercio = ANY($1)`;

    conn.query(sql, [codigos], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de servidor' });
        }

        if (results.rows.length > 0) {
            const codigosExistentes = results.rows.map(row => row.cod_comercio);
            const codigosConcatenados = codigosExistentes.join(', ');
            return res.status(404).json({
                error: `Código/os ya registrado/os en la base de datos: ${codigosConcatenados}`
            });
        }

        // Pasar al siguiente middleware o controlador si no hay errores
        next();
    });
};
