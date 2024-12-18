"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware que verifica si el la DDJJ de un contribuyente ya existe en la base de datos.
 * @param {object} req - El objeto de solicitud HTTP que contiene los parámetros de la ruta.
 * @param {object} res - El objeto de respuesta HTTP.
 * @param {function} next - Función para pasar el control al siguiente middleware o ruta.
 *
 * @throws {Error} Si hay un error en la consulta de la base de datos.
 *
 * Si una DDJJ determinada existe en la base de datos, responde con un código de estado 404 y un mensaje de error.
 * Si no existe, llama a la función `next` para permitir que la solicitud continúe.
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