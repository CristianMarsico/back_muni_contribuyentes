"use strict";
const { conn } = require('../dataBase/Connection.js');

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
    let anio = currentDate.getFullYear();
    let mes = currentDate.getMonth();    

    let year = parseInt(anio);  // Convertir a número    
    let month = parseInt(mes);// Convertimos también month a número
    const nextMonth = (month % 12) + 1;
    const nextYear = year;

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const today = new Date();
    const nombreMes = months[(today.getMonth() - 1 + 12) % 12];
   
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
        conn.query(query, [id_contribuyente, id_comercio, nextYear, nextMonth], (err, results) => {
            if (err) return res.status(500).json({ error: 'Error de servidor' });
            if (results.rows.length > 0) {
                return res.status(404).json({ error: `Ud. ya registró la DDJJ de dicho comercio correspondiente al mes de ${nombreMes}` });
            }
            return next();
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al verificar la existencia de la DDJJ.' });
    }
};