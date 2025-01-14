"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, updateExipirationDate } = require("../controllers/ExpirationDatesController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas para las fechas de vencimiento.
 * 
 * @param {Object} io - El objeto de Socket.io para emitir eventos.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {

    /**
     * Obtiene todas las fechas de vencimiento almacenadas en la base de datos.
     * @name GET /expirationDates
     * @function
     * @memberof module:routes/expirationDates
     * @param {Object} req - El objeto de solicitud HTTP, que no requiere parámetros adicionales.
     * @param {Object} res - El objeto de respuesta HTTP para enviar las fechas de vencimiento o un mensaje de error.
     * @returns {JSON} Un objeto JSON que contiene un array con las fechas de vencimiento o un mensaje de error si no hay fechas cargadas.
     * 
     * @example
     * // Ejemplo de uso:
     * app.get('/expirationDates', getAllController);
     */
    router.get("/expirationDates", AuthMiddleware, getAll);

    /**
     * Actualiza la fecha de vencimiento de un registro específico.
     * @name PUT /expirationDates/:id/:date
     * @function
     * @memberof module:routes/expirationDates
     * @param {Object} req - El objeto de solicitud HTTP que contiene los parámetros `id` y `date` para la actualización de la fecha.
     * @param {Object} res - El objeto de respuesta HTTP utilizado para devolver los datos actualizados o un mensaje de error.
     * @param {Object} io - El objeto de Socket.IO utilizado para emitir eventos de actualización.
     * @returns {JSON} Respuesta JSON con un mensaje de éxito y los datos actualizados, o un mensaje de error si la actualización falla.
     * 
     * @example
     * // Ejemplo de uso:
     * app.put('/expirationDates/:id/:date', updateExipirationDateController);
     */
    router.put("/expirationDates/:id/:date", AuthMiddleware, (req, res) => updateExipirationDate(req, res, io));
    
    return router;
};
