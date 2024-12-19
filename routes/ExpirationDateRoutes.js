"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, updateExipirationDate } = require("../controllers/ExpirationDatesController.js");

/**
 * Configura las rutas para las fechas de vencimiento.
 * 
 * @param {Object} io - El objeto de Socket.io para emitir eventos.
 * @returns {Object} El objeto de rutas de Express configurado.
 */
module.exports = (io) => {
    router.get("/expirationDates", getAll);
    router.put("/expirationDates/:id/:date", (req, res) => updateExipirationDate(req, res, io));
    return router;
};
