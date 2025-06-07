"use strict";
const {
    getAllNotifications, marcarNotificacionLeida
} = require('../models/NotificationModel.js');


/**
 * Controlador para obtener todas las configuraciones.
 * 
 * Este controlador maneja la solicitud para recuperar todas las configuraciones almacenadas en la base de datos.
 * Si se encuentran configuraciones, se devuelve una respuesta con el estado 200 y los datos correspondientes.
 * Si no se encuentran configuraciones, se devuelve una respuesta con el estado 404 y un mensaje de error.
 * En caso de error en el servidor, se devuelve una respuesta con el estado 500 y un mensaje de error.
 * 
 * @param {Object} req - El objeto de solicitud que representa la solicitud HTTP.
 * @param {Object} res - El objeto de respuesta que se utiliza para enviar la respuesta HTTP.
 * 
 * @returns {Object} - Respuesta JSON con el estado y los datos o mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/configuraciones', getAll);
 */
exports.getNotifications = async (req, res) => {
    try {
        let response = await getAllNotifications();      
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "No hay notificaciones" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para actualizar el estado 'cargada_rafam' de una DDJJ.
 * 
 * Este controlador maneja la solicitud para actualizar el campo `cargada_rafam` de una DDJJ 
 * a `true`, lo que indica que la DDJJ ha sido procesada. Si la actualización es exitosa, 
 * se emite un evento a través de `io.emit` y se devuelve una respuesta confirmando el éxito. 
 * Si no se encuentra la DDJJ, se devuelve un error de no encontrado.
 * 
 * @param {Object} req - El objeto de solicitud que contiene los parámetros `id_taxpayer`, `id_trade` e `id_date`.
 * @param {Object} res - El objeto de respuesta que se utiliza para devolver los resultados o un mensaje de error.
 * @param {Object} io - El objeto `io` utilizado para emitir eventos a través de WebSockets.
 * 
 * @returns {Object} - Respuesta JSON con el resultado de la operación, o un mensaje de error si la DDJJ no se pudo procesar.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/ddjj/:id_taxpayer/:id_trade/:id_date', updateStateSendRafamController);
 */
exports.marcarLeida = async (req, res, io) => {
    const { id} = req.params;   
    if (!id) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        let updated = await marcarNotificacionLeida(id);

        if (updated.rowCount > 0) {

            io.emit('notificacionLeida', { id });

            return res.status(200).json({
                message: "Leida",
                data: updated
            });
        } else {
            return res.status(404).json({ error: "La ddjj no se pudo procesar" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};