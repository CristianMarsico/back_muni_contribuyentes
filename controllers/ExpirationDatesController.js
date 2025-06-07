"use strict";
const {
    getAll, updateExipirationDate
} = require('../models/ExpirationDatesModel.js');

/**
 * Controlador para obtener todas las fechas de vencimiento.
 * 
 * Este controlador maneja la solicitud para obtener todas las fechas de vencimiento almacenadas en la base de datos. 
 * Si hay fechas disponibles, se devuelven en la respuesta; si no, se envía un mensaje indicando que no hay fechas cargadas.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene los parámetros para la consulta (en este caso, no se requieren parámetros adicionales).
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los datos o un error.
 * 
 * @returns {JSON} Respuesta JSON con las fechas de vencimiento si la operación es exitosa, o un mensaje de error si no hay fechas cargadas o si ocurre un problema.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/expirationDates', getAllController);
 */
exports.getAll = async (req, res) => {
    try {
        let response = await getAll();
        if (response && response.length > 0)
            return res.status(200).json({ response });

        return res.status(404).json({ error: "No hay fechas cargadas" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para actualizar la fecha de vencimiento.
 * 
 * Este controlador maneja la solicitud para actualizar la fecha de vencimiento de un registro en la base de datos. 
 * Si la actualización es exitosa, emite un evento y devuelve un mensaje de éxito. Si no se puede actualizar la fecha, 
 * devuelve un mensaje de error.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene los parámetros de la fecha y el id para la actualización.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los datos o un mensaje de error.
 * @param {Object} io - El objeto de Socket.IO para emitir eventos de actualización.
 * 
 * @returns {JSON} - Respuesta JSON con un mensaje de éxito y los datos actualizados, o un mensaje de error si la actualización falla.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/expirationDates/:id/:date', updateExipirationDateController);
 */
exports.updateExipirationDate = async (req, res, io) => {
    const { id, date } = req.params;   
    if (!id) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await updateExipirationDate(id, date);        
        // Si la actualización fue exitosa
        if (updatedActive.rowCount > 0) {
            io.emit('fecha-nueva', { updatedActive });
            return res.status(200).json({ message: "La fecha ha sido cambiada con éxito", data: updatedActive });
        } else {
            return res.status(404).json({ error: "La fecha no se pudo cambiar" });
        }       
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};