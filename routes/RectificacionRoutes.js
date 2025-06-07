"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { addRectificar, updateStateSendRectificar } = require("../controllers/RectificacionController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');


/**
 * Define las rutas relacionadas con los comercios.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    
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
    
    /**
     * Ruta para actualizar el estado de una rectificación de DDJJ, marcándola como enviada.
     * 
     * @name PUT /rectificar/:id_rectificacion
     * @function
     * @memberof module:routes/rectificacion
     * @param {string} id_rectificacion - ID de la rectificación a actualizar.
     * @middleware AuthMiddleware - Requiere autenticación.
     * @returns {JSON} Respuesta con la rectificación actualizada o un mensaje de error.
     */
    router.put("/rectificar/:id_rectificacion", AuthMiddleware, (req, res) => updateStateSendRectificar(req, res, io));
    return router;
};
