"use strict";
const {
    getAll, updateExipirationDate
} = require('../models/ExpirationDatesModel.js');

/**
 * Obtiene todas las fechas de vencimiento desde la base de datos.
 * Si se encuentran registros, se devuelven en formato JSON.
 * 
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
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
 * Actualiza la fecha de vencimiento de un registro específico y emite un evento de actualización.
 * 
 * @param {Object} req - La solicitud HTTP, que contiene los parámetros 'id' y 'date'.
 * @param {Object} res - La respuesta HTTP.
 * @param {Object} io - El objeto de Socket.io para emitir el evento de actualización.
 */
exports.updateExipirationDate = async (req, res, io) => {
    const { id, date } = req.params;   
    if (!id) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await updateExipirationDate(id, date);        
        // Si la actualización fue exitosa
        if (updatedActive.rowCount > 0) {
            io.emit('fecha-nueva', { updatedActive });
            return res.status(200).json({ message: "La fecha ha sifo cambiada con éxito", data: updatedActive });
        } else {
            return res.status(404).json({ error: "La fecha no se pudo cambiar" });
        }       
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

