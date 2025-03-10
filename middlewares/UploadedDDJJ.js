"use strict";
const { conn } = require('../dataBase/Connection.js');

/**
 * Middleware para verificar si un contribuyente ha registrado DDJJ en la base de datos.
 * 
 * Si el contribuyente lo ha hecho, se retorna un error indicando que el contribuyente ha registrado DDJJs.
 * Si no, se pasa al siguiente middleware.
 * 
 * @function UploadedDDJJ
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 * 
 * @returns {Object} Respuesta con el estado de la verificación o un error.
 */
exports.UploadedDDJJ = (req, res, next) => {
    const { id } = req.params;
    const sql = `SELECT 1 FROM ddjj WHERE id_contribuyente = $1`;
    conn.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error de servidor' });
        if (results.rows.length > 0) {           
            return res.status(404).json({ error: 'El contribuyente ha realizado al menos una carga de DDJJs' });
        }
        return next();
    });
};
