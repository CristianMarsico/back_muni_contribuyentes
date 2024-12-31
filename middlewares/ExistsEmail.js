"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware que verifica si el emial existe en la base de datos.
 * @param {object} req - El objeto de solicitud HTTP que contiene los parámetros de la ruta.
 * @param {object} res - El objeto de respuesta HTTP.
 * @param {function} next - Función para pasar el control al siguiente middleware o ruta.
 *
 * @throws {Error} Si hay un error en la consulta de la base de datos.
 *
 * Si el emial especificado existe en la base de datos, llama a la función `next` para permitir que la solicitud continúe.
 * Si no existe, responde con un código de estado 404 y un mensaje de error.
 */
exports.ExistsEmail = (req, res, next) => {
    const { email } = req.body;

    const sql = `SELECT 1 FROM CONTRIBUYENTE WHERE email = $1`;
    conn.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error de servidor' });
        if (results.rows.length > 0) {
            return next();
        }
        return res.status(404).json({ error: 'El email no se encuentra registrado' });
    });
};