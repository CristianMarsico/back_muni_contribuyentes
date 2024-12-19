"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware que verifica si los codigos de comercios ya existen en la base de datos.
 * @param {object} req - El objeto de solicitud HTTP que contiene los parámetros de la ruta.
 * @param {object} res - El objeto de respuesta HTTP.
 * @param {function} next - Función para pasar el control al siguiente middleware o ruta.
 *
 * @throws {Error} Si hay un error en la consulta de la base de datos.
 *
 * Si el codigo de comerico especificado existe en la base de datos, responde con un código de estado 404 y un mensaje de error.
 * Si no existe, llama a la función `next` para permitir que la solicitud continúe.
 */
exports.ExistsTrade = (req, res, next) => {
    const { misComercios } = req.body;

    if (!misComercios || !Array.isArray(misComercios)) {
        return res.status(400).json({ error: 'La lista de comercios no es válida' });
    }

    // Extraer los códigos de comercio de la lista de objetos
    const codigos = misComercios.map(comercio => comercio.codigo);

    // Verificar si hay códigos duplicados en la lista enviada
    const codigosDuplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);

    if (codigosDuplicados.length > 0) {
        const codigosConcatenados = [...new Set(codigosDuplicados)].join(', ');
        return res.status(400).json({
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
            return res.status(400).json({
                error: `Código/os ya registrado/os en la base de datos: ${codigosConcatenados}`
            });
        }

        // Pasar al siguiente middleware o controlador si no hay errores
        next();
    });
};
