"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware para verificar si el email ya está registrado en la base de datos.
 * 
 * Si el email ya está registrado, se pasa al siguiente middleware. Si no lo está,
 * se retorna un error indicando que el email no se encuentra registrado.
 * 
 * @function ExistsEmail
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 * 
 * @returns {Object} Respuesta con el estado de la verificación o un error.
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