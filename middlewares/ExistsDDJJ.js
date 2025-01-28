"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Middleware para verificar si ya existe una DDJJ registrada para el contribuyente
 * y el comercio especificado en el mes y año actuales.
 *
 * Si ya existe una DDJJ, se devuelve un error con el detalle de la DDJJ registrada.
 * Si no existe, se continúa con el siguiente middleware.
 *
 * @function ExistsDDJJ
 *
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 *
 * @returns {Object} Respuesta con el estado de la verificación o un error.
 */
exports.ExistsDDJJ = (req, res, next) => {   
    const { id_contribuyente, id_comercio } = req.body;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
   
    try {
        const query = `
            SELECT 1 
            FROM ddjj 
            WHERE id_contribuyente = $1 
            AND id_comercio = $2 
            AND EXTRACT(YEAR FROM fecha) = $3 
            AND EXTRACT(MONTH FROM fecha) = $4
            LIMIT 1
        `;
        conn.query(query, [id_contribuyente, id_comercio, year, month], (err, results) => {
            if (err) return res.status(500).json({ error: 'Error de servidor' });
            if (results.rows.length > 0) {
                return res.status(404).json({ error: `Ud. ya registró la DDJJ de dicho comercio correspondiente al mes ${month} del ${year}`});
            }
            return next();
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al verificar la existencia de la DDJJ.' });
    }
};