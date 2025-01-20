"use strict";
const express = require('express');
const router = express.Router();

const { getByYearTradeMonth, addDdjj, getAll, updateStateSendRafam, rectificar } = require("../controllers/DdjjController.js");
const { ExistsDDJJ } = require('../middlewares/ExistsDDJJ.js');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas relacionadas a las declaraciones juradas.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {

    /**
    * Ruta para obtener las DDJJ según el contribuyente, comercio, año y mes.
    * 
    * @route GET /ddjj/:id_taxpayer/:id_trade/:year/:month?
    * @param {string} id_taxpayer - ID del contribuyente.
    * @param {string} id_trade - ID del comercio.
    * @param {string} year - Año de la DDJJ.
    * @param {string} [month] - Mes de la DDJJ (opcional).
    * @returns {JSON} 200 - Objeto con las DDJJ encontradas o mensaje de error.
    */
    router.get("/ddjj/:id_taxpayer/:id_trade/:year/:month?", AuthMiddleware, getByYearTradeMonth);

    /**
     * Ruta para agregar una nueva DDJJ.
     * 
     * @route POST /ddjj
     * @param {object} body - Datos de la nueva DDJJ.
     * @param {string} body.id_contribuyente - ID del contribuyente.
     * @param {string} body.id_comercio - ID del comercio.
     * @param {number} body.monto - Monto de la DDJJ.
     * @param {string} body.descripcion - Descripción de la DDJJ.
     * @returns {JSON} Mensaje de éxito o error en caso de fallo..
     */
    router.post("/ddjj", ExistsDDJJ, AuthMiddleware, (req, res) => addDdjj(req, res, io));
    
    /**
     * Ruta para obtener todas las DDJJ que no han sido enviadas a 'rafam'.
     * 
     * Esta ruta devuelve todas las DDJJ de contribuyentes y comercios que aún no han sido enviadas a 'rafam'.
     * Si existen DDJJ que no han sido enviadas, se devuelven en la respuesta; de lo contrario, se indica que
     * todas ya fueron enviadas.
     * 
     * @name GET /ddjj
     * @function
     * @memberof module:routes/ddjj
     * @param {Object} req - Objeto de solicitud HTTP, que no requiere parámetros adicionales para esta ruta.
     * @param {Object} res - Objeto de respuesta HTTP que devuelve las DDJJ o un mensaje de error.
     * 
     * @returns {Object} Respuesta JSON con las DDJJ que no han sido enviadas a 'rafam', o un mensaje de error si todas fueron enviadas.
     * 
     * @example
     * // Ejemplo de uso:
     * fetch('/ddjj', {
     *   method: 'GET',
     *   headers: { 'Authorization': 'Bearer <token>' }
     * }).then(response => response.json())
     *   .then(data => console.log(data));
     */
    router.get("/ddjj", AuthMiddleware, getAll);

    /**
     * Ruta para actualizar el estado 'cargada_rafam' de una DDJJ.
     * 
     * Esta ruta actualiza el campo `cargada_rafam` de una DDJJ a `true`, lo que indica que la DDJJ ha sido procesada.
     * Una vez actualizada, se emite un evento a través de WebSockets y se devuelve una respuesta confirmando el éxito.
     * Si la DDJJ no se encuentra, se devuelve un mensaje de error de no encontrado.
     * 
     * @name PUT /ddjj/:id_taxpayer/:id_trade/:id_date
     * @function
     * @memberof module:routes/ddjj
     * @param {Object} req - Objeto de solicitud HTTP que contiene los parámetros `id_taxpayer`, `id_trade`, e `id_date`.
     * @param {Object} res - Objeto de respuesta HTTP utilizado para devolver los resultados o un mensaje de error.
     * @param {Object} io - Objeto `io` utilizado para emitir eventos a través de WebSockets.
     * 
     * @returns {Object} Respuesta JSON con el resultado de la operación, o un mensaje de error si la DDJJ no se pudo procesar.
     * 
     * @example
     * // Ejemplo de uso:
     * fetch('/ddjj/12345/67890/2025-01-14', {
     *   method: 'PUT',
     *   headers: {
     *     'Authorization': 'Bearer <token>',
     *     'Content-Type': 'application/json'
     *   },
     * }).then(response => response.json())
     *   .then(data => console.log(data));
     */
    router.put("/ddjj/:id_taxpayer/:id_trade/:id_date", AuthMiddleware, (req, res) => updateStateSendRafam(req, res, io));
    
    router.put("/rectificar/:id_taxpayer/:id_trade/:id_date", AuthMiddleware, (req, res) => rectificar(req, res, io));

    return router;
};