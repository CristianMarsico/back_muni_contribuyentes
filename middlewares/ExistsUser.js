"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware para verificar si un usuario ya está registrado en la base de datos.
 * 
 * Si el usuario ya existe, se retorna un error indicando que el usuario ya está registrado.
 * Si no, se pasa al siguiente middleware.
 * 
 * @function ExistsUser
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 * 
 * @returns {Object} Respuesta con el estado de la verificación o un error.
 */
exports.ExistsUser = (req, res, next) => {
    const { usuario } = req.body;   

    const sql = `SELECT 1 FROM USUARIO WHERE usuario = $1`;
    conn.query(sql, [usuario], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error de servidor' });
        if (results.rows.length > 0) {
            return res.status(404).json({ error: 'El usuario ya figura registrado' });
        }
        return next();
    });
};