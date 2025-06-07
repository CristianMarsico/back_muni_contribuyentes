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
 * Controlador para agregar una nueva rectificación de DDJJ y generar una notificación asociada.
 * 
 * Este controlador toma los datos necesarios desde la URL y el cuerpo del request para:
 * 1. Calcular la nueva tasa con lógica de buen contribuyente.
 * 2. Registrar la rectificación en la base de datos.
 * 3. Registrar una notificación de dicha acción.
 * 4. Emitir los eventos por WebSocket a los clientes conectados.
 * 
 * @param {Object} req - Objeto de la solicitud con:
 *     - params: { id_taxpayer, id_trade, id_date }
 *     - body: { monto, mes, cuit, cod_comercio, es_buen_contribuyente }
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Object} io - Instancia de WebSocket para emitir eventos en tiempo real.
 * 
 * @returns {Object} JSON con mensaje de éxito y datos de la rectificación o mensaje de error.
 * 
 * @example
 * PUT /api/rectificar/1/3/2025-06-01
 * body: {
 *   monto: 15000,
 *   mes: "Junio",
 *   cuit: "20123456789",
 *   cod_comercio: "A123",
 *   es_buen_contribuyente: true
 * }
 */
exports.addRectificar = async (req, res, io) => {

    const { id_taxpayer, id_trade, id_date } = req.params;
    const { monto, mes, cuit, cod_comercio, es_buen_contribuyente } = req.body;   
   
    const fechaRectificacion = new Date();

    const fechaFormateada = fechaRectificacion.toISOString().split("T")[0];

    if (!id_taxpayer || !id_trade || !id_date) return res.status(404).json({ error: "Faltan datos necesarios para editar" });

    try {
        const configuracion = await getAllConfig();     
        if (!configuracion) return res.status(500).json({ error: 'Error al obtener la configuración.' });

        const tasa_actual = parseFloat(configuracion[0].tasa_actual);
        const montoMinimo = parseFloat(configuracion[0].monto_defecto || 0);
        const porcentaje_buen_contribuyente = parseFloat(configuracion[0].porcentaje_buen_contribuyente);

        let montoFinal = monto;
        let tasa_calculada = montoFinal * tasa_actual;      

        if (es_buen_contribuyente) {
            if (tasa_calculada < montoMinimo)               
                tasa_calculada = montoMinimo - (montoMinimo * porcentaje_buen_contribuyente);
             else             
                tasa_calculada = tasa_calculada - (tasa_calculada * porcentaje_buen_contribuyente);
        }else{
            if (tasa_calculada < montoMinimo) 
                tasa_calculada = montoMinimo;
             else 
                tasa_calculada = tasa_calculada;
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