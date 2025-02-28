"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Middleware para verificar si el comercio con el código proporcionado ya está registrado.
 * 
 * Si el comercio ya está registrado, se retorna un error indicando que ya existe.
 * Si no lo está, se pasa al siguiente middleware.
 * 
 * @function ExistsNewTrade
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 * 
 * @returns {Object} Respuesta con el estado de la verificación o un error.
 */
exports.ExistsNewTrade = (req, res, next) => {
    const { codigo_comercio, id_contribuyente } = req.body;   

    const sql = `SELECT 1 FROM COMERCIO WHERE cod_comercio = $1 AND id_contribuyente <> $2 `;
    conn.query(sql, [codigo_comercio, id_contribuyente], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error de servidor' });
        if (results.rows.length > 0) {
            return res.status(404).json({ error: 'El comercio se encuentra registrado' });
        }
        return next();
    });
};