"use strict";
const {
    addRectificacion, updateStateRectificar
} = require('../models/RectificacionModel.js');

const {
   addNotificacion
} = require('../models/NotificationModel.js');

const {
    getAllConfig
} = require('../models/ConfigurarionModel.js');

/**
 * Controlador para rectificar una Declaración Jurada Jurada (DDJJ).
 * 
 * Este controlador maneja la solicitud para actualizar una DDJJ existente, rectificando su monto, 
 * tasa calculada y añadiendo una descripción. Si la rectificación es exitosa, se emite un evento 
 * mediante `io.emit` y se devuelve una respuesta confirmando el éxito.
 * 
 * @param {Object} req - Objeto de solicitud que contiene los parámetros `id_taxpayer`, `id_trade` e `id_date`.
 *                        También incluye los datos del cuerpo de la solicitud como `monto`, `mes` y `fecha`.
 * @param {Object} res - Objeto de respuesta utilizado para devolver los resultados o un mensaje de error.
 * @param {Object} io - Objeto `io` utilizado para emitir eventos mediante WebSockets.
 * 
 * @returns {Object} - Respuesta JSON con el resultado de la operación o un mensaje de error si la rectificación falla.
 * 
 * @example
 * // Ejemplo de uso:
 * router.put("/rectificar/:id_taxpayer/:id_trade/:id_date", rectificarController);
 */
exports.addRectificar = async (req, res, io) => {

    const { id_taxpayer, id_trade, id_date } = req.params;
    const { monto, mes, cuit, cod_comercio } = req.body;   

    const fechaRectificacion = new Date();

    const fechaFormateada = fechaRectificacion.toISOString().split("T")[0];

    if (!id_taxpayer || !id_trade || !id_date) return res.status(404).json({ error: "Faltan datos necesarios para editar" });

    try {
        const configuracion = await getAllConfig();
        if (!configuracion) return res.status(500).json({ error: 'Error al obtener la configuración.' });
        let montoFinal = monto;
        let tasa_calculada = montoFinal * configuracion[0].tasa_actual;

        const montoMinimo = configuracion[0].monto_defecto || 0;

        // Si la tasa calculada es menor que el monto mínimo, se cobra el monto mínimo
        if (tasa_calculada < montoMinimo) {
            tasa_calculada = montoMinimo
        }     

        let rectificada = await addRectificacion(id_taxpayer, id_trade, id_date, montoFinal, tasa_calculada, mes, fechaFormateada)
        
        if (!rectificada) return res.status(404).json({ error: 'No se pudo rectificar la DDJJ.' });
        
        // Registrar notificación separadamente
        const notificacion = await addNotificacion(
            false,
            fechaFormateada,
            cuit,
            montoFinal,
            cod_comercio,
            mes
        );

        io.emit('addRectificacion', { rectificada });        
        io.emit('nuevaNotificacion', notificacion);
        
        return res.status(200).json({ message: 'Rectificación registrada exitosamente.', data: rectificada });

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
exports.updateStateSendRectificar = async (req, res, io) => {
    const { id_rectificacion } = req.params;
    if (!id_rectificacion) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        let updatedActive = await updateStateRectificar(id_rectificacion);

        if (updatedActive.rowCount > 0) {
            // io.emit('ddjj-rectificar', {                
            //     id_rectificacion,
            //     enviada: true
            // });
            return res.status(200).json({
                message: "Marcada, recuerde enviarla a RAFAM",
                data: updatedActive
            });
        } else {
            return res.status(404).json({ error: "La rectificación no se pudo procesar" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};