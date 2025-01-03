"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, get, activeState, newTrade } = require("../controllers/TradeController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');
const { ExistsNewTrade } = require("../middlewares/ExistsNewTrade.js");

/**
 * Define las rutas relacionadas con los comercios.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    /**
    * Obtiene todos los comercios.
    * @name GET /trade
    * @function
    * @memberof module:routes/trade
    * @returns {JSON} Lista de comercios o un error en caso de que no haya datos.
    */

    router.get("/trade", getAll);
    /**
         * Obtiene un comercio específico asociado a un contribuyente.
         * @name GET /trade/:id
         * @function
         * @memberof module:routes/trade
         * @param {string} id - ID del contribuyente.
         * @returns {JSON} Datos del comercio asociado o un error en caso de que no existan.
         */
    router.get("/trade/:id", get);

    /**
     * Actualiza el estado de un comercio y emite un evento.
     * @name PUT /trade/:id
     * @function
     * @memberof module:routes/trade
     * @param {string} id - ID del comercio.
     * @returns {JSON} Mensaje de éxito o error en caso de fallo.
     */
    router.put("/trade/:id", AuthMiddleware, (req, res) => activeState(req, res, io));

    router.post("/trade", ExistsNewTrade, AuthMiddleware, (req, res) => newTrade(req, res, io));

    return router;
};
