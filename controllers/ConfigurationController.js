"use strict";
const {
    getAll, updateConfiguration
} = require('../models/ConfigurarionModel.js');


/**
 * Controlador para obtener todas las configuraciones de la base de datos.
 * 
 * <p>Este controlador realiza una consulta para obtener todas las configuraciones 
 * almacenadas en la base de datos y devolverlas como una respuesta JSON. Si no se 
 * encuentran configuraciones, se devuelve un error con estado 404.</p>
 * 
 * @function getAll
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} Respuesta con las configuraciones o un error.
 *  - 200: Si se encuentran configuraciones.
 *  - 404: Si no hay configuraciones disponibles.
 *  - 500: Si ocurre un error en el servidor.
 */
exports.getAll = async (req, res) => {
    try {
        let response = await getAll();
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "No hay configuraciones cargadas" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para actualizar una configuración específica en la base de datos.
 * 
 * <p>Este controlador realiza las validaciones necesarias para asegurarse de que los 
 * datos de entrada sean correctos, actualiza la configuración en la base de datos 
 * y emite un evento WebSocket si la actualización es exitosa.</p>
 * 
 * @function updateConfiguration
 * @param {Object} req - El objeto de solicitud que contiene el ID de la configuración y los datos a actualizar.
 * @param {Object} res - El objeto de respuesta.
 * @param {Object} io - El objeto de Socket.io utilizado para emitir eventos.
 * @returns {Object} Respuesta con el estado de la operación.
 *  - 200: Si la configuración fue actualizada correctamente.
 *  - 404: Si hay un error en la actualización o datos inválidos.
 *  - 500: Si ocurre un error en el servidor.
 */
exports.updateConfiguration = async (req, res, io) => {
    const { id } = req.params;
    const { fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual } = req.body;
   
    if (fecha_limite_ddjj > 31)
        return res.status(404).json({ error: 'La fecha no debe superar el dia 31' });

    // Verificar que los campos sean válidos
    if (!fecha_limite_ddjj || !monto_ddjj_defecto || !tasa_actual) {
        return res.status(404).json({ error: 'Todos los campos son obligatorios' });
    }

    if (isNaN(fecha_limite_ddjj) || isNaN(monto_ddjj_defecto) || isNaN(tasa_actual)) {
        return res.status(404).json({ error: 'Los valores deben ser números válidos' });
    }

    try {
        // Llamar al modelo para actualizar la configuración
        const result = await updateConfiguration(
            id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual
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


