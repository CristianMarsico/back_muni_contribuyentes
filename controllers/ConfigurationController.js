"use strict";
const {
    getAllConfig, updateConfigurationValues, updateConfigurationInfo
} = require('../models/ConfigurarionModel.js');

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
exports.getAll = async (req, res) => {
    try {
        let response = await getAllConfig();
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "No hay configuraciones cargadas" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para actualizar la configuración.
 * 
 * Este controlador maneja la solicitud para actualizar la configuración en la base de datos.
 * Valida que los campos proporcionados sean válidos y actualiza la configuración correspondiente.
 * Si la actualización es exitosa, emite un evento y devuelve una respuesta con el estado 200.
 * Si ocurre un error en el servidor, se devuelve una respuesta con el estado 500 y un mensaje de error.
 * 
 * @param {Object} req - El objeto de solicitud que contiene los parámetros y el cuerpo de la solicitud.
 * @param {Object} res - El objeto de respuesta que se utiliza para devolver los resultados o un mensaje de error.
 * @param {Object} io - El objeto de entrada/salida para emitir eventos en tiempo real.
 * 
 * @returns {Object} - Respuesta JSON con el estado y el mensaje correspondiente.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/configuracion/:id', updateConfiguration);
 */
exports.updateConfigurationValues = async (req, res, io) => {
    const { id } = req.params;
    const { fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, porcentaje_buen_contribuyente } = req.body;

    if (fecha_limite_ddjj > 31)
        return res.status(404).json({ error: 'La fecha no debe superar el dia 31' });

    // Verificar que los campos sean válidos
    if (!fecha_limite_ddjj || !monto_ddjj_defecto || !tasa_actual) {
        return res.status(404).json({ error: 'Todos los campos son obligatorios' });
    }

    if (isNaN(fecha_limite_ddjj) || isNaN(monto_ddjj_defecto) || isNaN(tasa_actual) || isNaN(porcentaje_buen_contribuyente)) {
        return res.status(404).json({ error: 'Los valores deben ser números válidos' });
    }

    try {
        // Llamar al modelo para actualizar la configuración
        const result = await updateConfigurationValues(
            id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, porcentaje_buen_contribuyente
        );
        // Si la actualización fue exitosa
        if (result.rowCount > 0) {
            io.emit('nuevos-valores', { result });
            return res.status(200).json({ message: 'Configuración actualizada correctamente' });
        } else {
            return res.status(404).json({ error: 'Error al actualizar la configuración' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Hubo un error al actualizar la configuración' });
    }
};

/**
 * Controlador para actualizar la configuración de informacion municipal.
 * 
 * Este controlador maneja la solicitud para actualizar la configuración en la base de datos.
 * Valida que los campos proporcionados sean válidos y actualiza la configuración correspondiente.
 * Si la actualización es exitosa, emite un evento y devuelve una respuesta con el estado 200.
 * Si ocurre un error en el servidor, se devuelve una respuesta con el estado 500 y un mensaje de error.
 * 
 * @param {Object} req - El objeto de solicitud que contiene los parámetros y el cuerpo de la solicitud.
 * @param {Object} res - El objeto de respuesta que se utiliza para devolver los resultados o un mensaje de error.
 * @param {Object} io - El objeto de entrada/salida para emitir eventos en tiempo real.
 * 
 * @returns {Object} - Respuesta JSON con el estado y el mensaje correspondiente.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/configuracion/:id', updateConfiguration);
 */
exports.updateConfigurationInfo = async (req, res, io) => {
    const { id } = req.params;
    const { whatsapp, email, telefono, direccion, facebook, instagram } = req.body;

    // Verificar que los campos sean válidos
    if (!whatsapp || !email || !telefono || !direccion || !facebook || !instagram) {
        return res.status(404).json({ error: 'Todos los campos son obligatorios' });
    }
    try {
        // Llamar al modelo para actualizar la configuración
        const result = await updateConfigurationInfo(
            id, whatsapp, email, telefono, direccion, facebook, instagram
        );
        // Si la actualización fue exitosa
        if (result.rowCount > 0) {
            io.emit('new-info', { result });
            return res.status(200).json({ message: 'Información actualizada correctamente' });
        } else {
            return res.status(404).json({ error: 'Error al actualizar la información' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Hubo un error al actualizar la información' });
    }
};


