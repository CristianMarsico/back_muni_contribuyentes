"use strict";
const {
    getByYearTradeMonth, addDdjj, getAllDDJJ, updateStateSendRafam
} = require('../models/DdjjModel.js');

const {
    getAllConfig
} = require('../models/ConfigurarionModel.js');


/**
 * Controlador para obtener las DDJJ de un contribuyente y comercio por año y mes.
 * 
 * Este controlador maneja la solicitud para obtener las DDJJ asociadas a un contribuyente y comercio específico 
 * para un año y mes determinados. Si hay resultados, devuelve las DDJJ en formato JSON. Si no se encuentran resultados, 
 * devuelve un mensaje de error dependiendo de si se especificó un mes o no.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene los parámetros `id_taxpayer`, `id_trade`, `year` y `month`.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los datos o un mensaje de error.
 * 
 * @returns {Object} - Respuesta JSON con las DDJJ encontradas o un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/ddjj/:id_taxpayer/:id_trade/:year/:month?', getByYearTradeMonthController);
 */
exports.getByYearTradeMonth = async (req, res) => {
    const { id_taxpayer, id_trade, year, month } = req.params;
    
    let anio = parseInt(year);  // Convertir a número
    // Convertimos también month a número
    let mes = parseInt(month);    
    const nextMonth = (mes % 12) + 1;
    const nextYear = mes === 12 ? anio + 1 : anio;    
    
    try {
        let response = await getByYearTradeMonth(id_taxpayer, id_trade, nextYear, nextMonth);
        if (response && response.length > 0) return res.status(200).json({ response });
        if (!month) return res.status(404).json({ error: "Ud. aún no ha cargado ninguna ddjj" });
        else return res.status(404).json({ error: "No hay DDJJ correspondientes al mes " + month });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para agregar una nueva DDJJ (Declaración Jurada) de un contribuyente y comercio.
 * 
 * Este controlador maneja la solicitud para agregar una nueva DDJJ. Valida que los datos del contribuyente, 
 * comercio, monto y descripción sean correctos y completos. Luego calcula la tasa aplicable y verifica si 
 * la DDJJ fue cargada dentro del tiempo permitido. Si todo es correcto, agrega la DDJJ en la base de datos 
 * y emite un evento para notificar a los clientes conectados.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene los datos de la nueva DDJJ.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los resultados o un mensaje de error.
 * @param {Object} io - El objeto de Socket.IO utilizado para emitir eventos en tiempo real.
 * 
 * @returns {Object} - Respuesta JSON con el mensaje de éxito y los datos de la nueva DDJJ o un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.post('/ddjj', addDdjjController);
 */
exports.addDdjj = async (req, res, io) => {
    const { id_contribuyente, id_comercio, monto, descripcion, buen_contribuyente } = req.body;
    try {
        if (!id_contribuyente || !id_comercio || !monto || monto <= 0) return res.status(400).json({ error: 'Datos inválidos o incompletos.' });

        const configuracion = await getAllConfig();
        if (!configuracion) return res.status(500).json({ error: 'Error al obtener la configuración.' });

        const diaActual = new Date().getDate();
        const diaLimite = configuracion[0].fecha_limite_ddjj;

        let cargadaEnTiempo = true;

        const tasa_actual = parseFloat(configuracion[0].tasa_actual);
        const montoMinimo = parseFloat(configuracion[0].monto_defecto || 0);
        const porcentaje_buen_contribuyente = parseFloat(configuracion[0].porcentaje_buen_contribuyente);

        let montoFinal = monto;
        let tasa_calculada = montoFinal * tasa_actual;

        if (buen_contribuyente) {
            if (tasa_calculada < montoMinimo)
                tasa_calculada = montoMinimo - (montoMinimo * porcentaje_buen_contribuyente);
            else
                tasa_calculada = tasa_calculada - (tasa_calculada * porcentaje_buen_contribuyente);
        } else {
            if (tasa_calculada < montoMinimo)
                tasa_calculada = montoMinimo;
            else
                tasa_calculada = tasa_calculada;
        }

        //EN CASO DE QUE SUPERE LA FECHA
        if (diaActual >= diaLimite) {
            return res.status(404).json({ error: 'Su DDJJ ha sido cargada por el sistema. Debe RECTIFICAR' });
        }

        //AGREGO LA DDJJ
        const nuevaDdjj = await addDdjj(id_contribuyente, id_comercio, montoFinal, descripcion, cargadaEnTiempo, tasa_calculada);
        if (!nuevaDdjj) return res.status(404).json({ error: 'No se pudo agregar la DDJJ.' });
        io.emit('nueva-ddjj', { nuevaDdjj });
        return res.status(200).json({ message: 'DDJJ registrada exitosamente.', data: nuevaDdjj });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Controlador para obtener todas las DDJJ que no han sido enviadas a 'rafam'.
 * 
 * Este controlador maneja la solicitud para recuperar las DDJJ de contribuyentes y comercios que aún no 
 * han sido marcadas como enviadas a 'rafam'. Si hay DDJJ que cumplen con esta condición, se devuelven 
 * en la respuesta; de lo contrario, se informa que todas las DDJJ ya fueron enviadas.
 * 
 * @param {Object} req - El objeto de solicitud que contiene los datos de la consulta.
 * @param {Object} res - El objeto de respuesta utilizado para devolver los resultados o un mensaje de error.
 * 
 * @returns {Object} - Respuesta JSON con las DDJJ que no han sido enviadas a 'rafam', o un mensaje de error
 * si todas las DDJJ ya han sido enviadas.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/ddjj/no-send-rafam', getAllNoSendRafamController);
 */
exports.getAll = async (req, res) => {
    try {
        let response = await getAllDDJJ();
        if (response && response.length > 0)
            return res.status(200).json({ response });
        return res.status(404).json({ error: "Aún no se han cargado DDJJ" });
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
exports.updateStateSendRafam = async (req, res, io) => {
    const { id_taxpayer, id_trade, id_date } = req.params;
    if (!id_taxpayer || !id_trade || !id_date) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        let updatedActive = await updateStateSendRafam(id_taxpayer, id_trade, id_date);

        if (updatedActive.rowCount > 0) {
            io.emit('ddjj-newState', {
                id_taxpayer,
                id_trade,
                id_date,
                cargada_rafam: true
            });
            return res.status(200).json({
                message: "La DDJJ ha sido procesada con éxito",
                data: updatedActive
            });
        } else {
            return res.status(404).json({ error: "La ddjj no se pudo procesar" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};
