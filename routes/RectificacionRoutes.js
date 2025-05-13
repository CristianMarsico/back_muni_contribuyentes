"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { addRectificacion, addRectificar, updateStateSendRectificar } = require("../controllers/RectificacionController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');


/**
 * Define las rutas relacionadas con los comercios.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    // /**
    //  * Persiste los datos de un nuevo comercio en la base de datos y emite un evento.
    //  * @name POST /trade
    //  * @function
    //  * @memberof module:routes/trade
    //  * @param {Object} req - Objeto de solicitud HTTP.
    //  * @param {Object} res - Objeto de respuesta HTTP.
    //  * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
    //  * @returns {JSON} Mensaje de éxito o error en caso de fallo.
    //  */
    // router.post("/rectificar", AuthMiddleware, (req, res) => addRectificacion(req, res, io));


    /**
     * Ruta para rectificar una DDJJ.
     * 
     * Esta ruta actualiza el monto y la tasa de una ddjj de una DDJJ.
     * Una vez actualizada, se emite un evento a través de WebSockets y se devuelve una respuesta confirmando el éxito.
     * Si la DDJJ no se encuentra, se devuelve un mensaje de error de no encontrado.
     * 
     * @name PUT /rectificar/:id_taxpayer/:id_trade/:id_date
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
     * fetch('/rectificar/20301312319/67890/2025-01-14', {
     *   method: 'PUT',
     *   headers: {
     *     'Authorization': 'Bearer <token>',
     *     'Content-Type': 'application/json'
     *   },
     * }).then(response => response.json())
     *   .then(data => console.log(data));
     */
    router.put("/rectificar/:id_taxpayer/:id_trade/:id_date", AuthMiddleware, (req, res) => addRectificar(req, res, io));
    router.put("/rectificar/:id_taxpayer/:id_trade/:id_date/:id_rectificacion", AuthMiddleware, (req, res) => updateStateSendRectificar(req, res, io));
    return router;
};
