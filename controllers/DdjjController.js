"use strict";
const {
    getByYearTradeMonth, addDdjj, getAllNoSendRafam, updateStateSendRafam
} = require('../models/DdjjModel.js');

const {
    getAll
} = require('../models/ConfigurarionModel.js');


/**
 * Obtiene las DDJJ de un contribuyente y comercio según el año y el mes (opcional).
 * 
 * @function getByYearTradeMonth
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
 * @returns {object} 200 - Objeto con las DDJJ encontradas.
 * @returns {object} 404 - Error si no se encuentran DDJJ para el mes o año.
 * @returns {object} 500 - Error de servidor.
 */
exports.getByYearTradeMonth = async (req, res) => {
    const { id_taxpayer, id_trade, year, month } = req.params;
    try {
        let response = await getByYearTradeMonth(id_taxpayer, id_trade, year, month);
        if (response && response.length > 0) return res.status(200).json({ response });
        if (!month) return res.status(404).json({ error: "Ud. aún no ha cargado ninguna ddjj" });
        else return res.status(404).json({ error: "No hay DDJJ correspondientes al mes " + month });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Agrega una nueva DDJJ para un contribuyente y comercio.
 * 
 * @function addDdjj
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
 * @returns {object} 200 - Mensaje de éxito y datos de la nueva DDJJ.
 * @returns {object} 404 - Error si no se puede agregar la DDJJ.
 * @returns {object} 500 - Error de servidor.
 */
exports.addDdjj = async (req, res, io) => {
    const { id_contribuyente, id_comercio, monto, descripcion } = req.body;
    try {
        if (!id_contribuyente || !id_comercio || !monto || monto <= 0) return res.status(400).json({ error: 'Datos inválidos o incompletos.' });
        

        const configuracion = await getAll();
        if (!configuracion) return res.status(500).json({ error: 'Error al obtener la configuración.' });
        

        const diaActual = new Date().getDate(); 
        const diaLimite = configuracion[0].fecha_limite_ddjj;

        // const diaActual = 28
        // const diaLimite = 27

        let cargadaEnTiempo = true;

        let montoFinal = monto;
        let tasa_calculada = montoFinal * configuracion[0].tasa_actual;
      

        //EN CASO DE QUE SUPERE LA FECHA
        if (diaActual > diaLimite) {
            cargadaEnTiempo = false;
            //montoFinal = configuracion[0].monto_defecto; //2000 PESOS
            tasa_calculada = montoFinal * configuracion[0].tasa_default;
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

exports.getAllNoSendRafam = async (req, res) => {
    try {
        let response = await getAllNoSendRafam();
        if (response && response.length > 0)
            return res.status(200).json({ response });
        return res.status(404).json({ error: "Todas las ddjj han sido cargadas en rafam" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

exports.updateStateSendRafam = async (req, res, io) => {
    const { id_taxpayer, id_trade, id_date } = req.params;    
    if (!id_taxpayer ||!id_trade || !id_date) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        let updatedActive = await updateStateSendRafam(id_taxpayer, id_trade, id_date);
        
        if (updatedActive.rowCount > 0) {
            io.emit('ddjj-newState', { updatedActive });
            return res.status(200).json({ message: "La ddjj ha sido procesada con éxito", data: updatedActive });
        } else {
            return res.status(404).json({ error: "La ddjj no se pudo procesar" });
        }       
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

