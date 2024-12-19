"use strict";
const {
    getAll, editActive, getWithTrade
} = require('../models/TaxpayerModel.js');

/**
 * Controlador para obtener todos los contribuyentes.
 *
 * @function getAll
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @throws {Error} 404 - Si no hay contribuyentes en la base de datos.
 * @throws {Error} 500 - Si ocurre un error en el servidor.
 */
exports.getAll = async (req, res) => {
    try {
        let response = await getAll();
        if (response && response.length > 0)
            return res.status(200).json({ response });
     
        return res.status(404).json({ error: "No hay contribuyetes en la base de datos" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para obtener un contribuyente con sus comercios.
 *
 * @function getWithTrade
 * @param {Object} req - Objeto de solicitud HTTP, debe contener el parámetro `id`.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @throws {Error} 404 - Si no hay comercios asociados al contribuyente.
 * @throws {Error} 500 - Si ocurre un error en el servidor.
 */
exports.getWithTrade = async (req, res) => {
    const { id } = req.params;
    try {
        let response = await getWithTrade(id);
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "Ud no tiene comercios registrados" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};


/**
 * Controlador para actualizar el estado de un contribuyente.
 *
 * @function editActive
 * @param {Object} req - Objeto de solicitud HTTP, debe contener el parámetro `id`.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
 * @throws {Error} 400 - Si faltan datos necesarios para la operación.
 * @throws {Error} 404 - Si no se pudo actualizar el estado del contribuyente.
 * @throws {Error} 500 - Si ocurre un error en el servidor.
 */
exports.editActive = async (req, res, io) => {
    const { id } = req.params;   
    if (!id) return res.status(400).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await editActive(id);
        if (!updatedActive) return res.status(404).json({ error: "El estado no se pudo cambiar" });
       
        // Emitir el estado actualizado con los datos necesarios
        io.emit("estado-actualizado", {
            id_contribuyente: updatedActive.id_contribuyente,
            estado: updatedActive.estado
        });

        return res.status(200).json({
            message: "El contribuyente ha sido dado de alta",
            data: updatedActive
        });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};