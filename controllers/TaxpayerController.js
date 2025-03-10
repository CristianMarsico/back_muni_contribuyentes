"use strict";
const { conn } = require('../dataBase/Connection.js');

const {
    getAll, editActive, getWithTrade, deleteTaxpayer
} = require('../models/TaxpayerModel.js');

const {
    deleteTradesWithoutDDJJ, backupComercios
} = require('../models/TradeModel.js');
/**
 * Controlador para obtener todos los contribuyentes de la base de datos.
 * 
 * Este controlador maneja la solicitud para obtener todos los contribuyentes registrados en la base de datos.
 * Si se encuentran contribuyentes, se devuelve una respuesta con los datos; de lo contrario, se devuelve un error 404.
 * 
 * @param {Object} req - El objeto de la solicitud, que no requiere parámetros para esta función.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los datos o un error.
 * 
 * @returns {Object} - Respuesta con los datos de los contribuyentes si existen, o un mensaje de error si no se encuentran.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/contribuyentes', getAllController);
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
 * Controlador para obtener los datos de un contribuyente junto con sus comercios.
 * 
 * Este controlador maneja la solicitud para obtener la información del contribuyente, incluyendo sus comercios
 * asociados. Si se encuentran datos, se devuelve una respuesta con los detalles; de lo contrario, se devuelve un error 404.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene el parámetro `id` en la URL.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los datos o un error.
 * 
 * @returns {Object} - Respuesta con los datos del contribuyente y sus comercios si existen, o un mensaje de error si no se encuentran.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/contribuyentes/:id/comercios', getWithTradeController);
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
 * Controlador para editar el estado de un contribuyente (activar).
 * 
 * Este controlador maneja la solicitud para activar a un contribuyente cambiando su estado a `true`. 
 * Si el contribuyente es encontrado y actualizado correctamente, se devuelve una respuesta con los datos del contribuyente actualizado;
 * si no se encuentra o no se puede actualizar, se devuelve un mensaje de error.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene el parámetro `id` en la URL.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los datos o un error.
 * @param {Object} io - El objeto de la conexión de WebSocket para emitir eventos en tiempo real.
 * 
 * @returns {Object} - Respuesta con el estado actualizado del contribuyente si la operación es exitosa, o un mensaje de error si ocurre un problema.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/contribuyentes/:id/activar', editActiveController);
 */
exports.editActive = async (req, res, io) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await editActive(id);
        if (!updatedActive) return res.status(404).json({ error: "No fue posible darlo de alta" });

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

exports.deleteTaxpayer = async (req, res) => {
     const { id } = req.params;

    const client = await conn.connect(); // Obtener conexión

    try {
        await client.query('BEGIN'); // Iniciar transacción

        const resultComercios = await backupComercios(id);       
        if (!resultComercios) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "No se encontraron comercios para respaldar." });
        }
        // Eliminar los comercios sin DDJJ
        await deleteTradesWithoutDDJJ(id);
        
        // Eliminar el contribuyente
        const resultTaxpayer = await deleteTaxpayer(id);

        if (resultTaxpayer.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "No se encontró el contribuyente para eliminar." });
        }

        await client.query('COMMIT'); // Confirmar los cambios
        return res.status(200).json({ message: "El contribuyente ha sido dado de baja" });

    } catch (error) {
        await client.query('ROLLBACK'); // Revertir la transacción en caso de error
        res.status(500).json({ error: `Error de servidor: ${error.message}` });
    } finally {
        client.release(); // Liberar la conexión
    }
};