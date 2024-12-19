"use strict";
const {
    getByYearTradeMonth, addDdjj
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
exports.addDdjj = async (req, res) => {
    const { id_contribuyente, id_comercio, monto, descripcion } = req.body;
    try {
        if (!id_contribuyente || !id_comercio || !monto || monto <= 0) {
            return res.status(400).json({ error: 'Datos inválidos o incompletos.' });
        }

        const configuracion = await getAll();
        if (!configuracion) {
            return res.status(500).json({ error: 'Error al obtener la configuración.' });
        }

        const diaActual = new Date().getDate(); 
        const diaLimite = configuracion[0].fecha_limite_ddjj;

        let cargadaEnTiempo = true;

        let montoFinal = monto;

        if (diaActual > diaLimite) {
            cargadaEnTiempo = false;
            montoFinal = configuracion[0].monto_defecto; // Usar el monto por defecto
        }

        const tasa_calculada = montoFinal * configuracion[0].tasa_actual;
        const nuevaDdjj = await addDdjj(id_contribuyente, id_comercio, monto, descripcion, cargadaEnTiempo, tasa_calculada);
        if (!nuevaDdjj) return res.status(404).json({ error: 'No se pudo agregar la DDJJ.' });
    
        return res.status(200).json({ message: 'DDJJ registrada exitosamente.', data: nuevaDdjj });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};