"use strict";
const {
    getAll, get, activeState, newTrade, updateTrade
} = require('../models/TradeModel.js');

/**
 * Controlador para obtener todos los comercios de la base de datos.
 * 
 * Este controlador maneja la solicitud para obtener todos los comercios almacenados en la base de datos. 
 * Si se encuentran comercios, se devuelve una lista con la información de todos ellos. Si no se encuentran comercios, 
 * se devuelve un error con el mensaje adecuado.
 * 
 * @param {Object} req - El objeto de la solicitud, que no contiene parámetros adicionales en este caso.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los comercios o un error.
 * 
 * @returns {Object} - Respuesta con la lista de comercios o un error si no se encuentran registros.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/comercios', getAllComerciosController);
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
 * Controlador para obtener los comercios registrados de un contribuyente.
 * 
 * Este controlador maneja la solicitud para obtener todos los comercios registrados de un contribuyente,
 * utilizando el ID del contribuyente proporcionado. Si se encuentran comercios, se devuelve una lista con 
 * la información de los comercios. Si no se encuentran comercios, se devuelve un error con el mensaje adecuado.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene el parámetro `id` (ID del contribuyente).
 * @param {Object} res - El objeto de la respuesta utilizado para devolver los comercios o un error.
 * 
 * @returns {Object} - Respuesta con la lista de comercios o un error si no se encuentran registros.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/comercios/:id', getComerciosController);
 */
exports.get = async (req, res) => {
    const { id } = req.params;
    try {
        let response = await get(id);
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "Ud no tiene comercios registrados" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para cambiar el estado de un comercio a "activo".
 * 
 * Este controlador maneja la solicitud para cambiar el estado de un comercio a "activo" utilizando su ID. 
 * Si el ID no se proporciona o si no se encuentra el comercio, se devolverá un error. 
 * Si el cambio de estado es exitoso, se devuelve un mensaje de éxito y se emite un evento.
 * 
 * @param {Object} req - El objeto de la solicitud, que contiene el parámetro `id` en los parámetros de la URL.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver el estado del cambio o un error.
 * @param {Object} io - El objeto de Socket.IO utilizado para emitir el evento `comercio-nuevo` en caso de éxito.
 * 
 * @returns {Object} - Respuesta con el mensaje de éxito o error, según el resultado del cambio de estado.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/comercio/activar/:id', activeStateController);
 */
exports.activeState = async (req, res, io) => {
    const { id } = req.params;
    if (!id) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await activeState(id);
        if (!updatedActive) return res.status(404).json({ error: "El estado no se pudo cambiar" });
        io.emit('comercio-nuevo', { id });
        return res.status(200).json({ message: "El comercio ha sido dado de alta", data: updatedActive });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

exports.updateTrade = async (req, res, io) => {
    const { id_trade, id_taxpayer } = req.params;
   const{codigo_comercio, nombre_comercio, direccion_comercio} = req.body;
   
    if (!id_trade) return res.status(404).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await updateTrade(id_trade, id_taxpayer, codigo_comercio, nombre_comercio, direccion_comercio);
        if (!updatedActive) return res.status(404).json({ error: "No se pudo editar" });
        io.emit('comercio-editado', { id_trade });
        return res.status(200).json({ message: "El comercio ha sido editado exitosamente", data: updatedActive });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para registrar un nuevo comercio asociado a un contribuyente.
 * 
 * Este controlador maneja la solicitud para registrar un nuevo comercio. 
 * Si faltan datos obligatorios, se devuelve un error. Si el registro del comercio es exitoso, 
 * se emite un evento y se devuelve una respuesta de éxito.
 * 
 * @param {Object} req - El objeto de la solicitud, que contiene los datos del nuevo comercio en el cuerpo de la solicitud.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver el estado de la creación o un error.
 * @param {Object} io - El objeto de Socket.IO utilizado para emitir el evento `new-trade` en caso de éxito.
 * 
 * @returns {Object} - Respuesta con el mensaje de éxito o error, según el resultado del registro.
 * 
 * @example
 * // Ejemplo de uso:
 * app.post('/comercio/registrar', newTradeController);
 */
exports.newTrade = async (req, res, io) => {
    const { id_contribuyente, codigo_comercio, nombre_comercio, direccion_comercio } = req.body;
    try {
        if (!id_contribuyente) return res.status(404).json({ error: 'Error, faltan datos obligatorios.' });
        // Agregar los comercios si existen  
        const comerciosAgregado = await newTrade(id_contribuyente, codigo_comercio, nombre_comercio, direccion_comercio);
        if (!comerciosAgregado) return res.status(404).json({ error: 'Error al agregar comercio.' });

        // Emitir el nuevo contribuyente con todos sus datos
        io.emit('new-trade', { id_contribuyente });
        return res.status(200).json({ message: 'Comercio registrado exitosamente.', data: comerciosAgregado });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};