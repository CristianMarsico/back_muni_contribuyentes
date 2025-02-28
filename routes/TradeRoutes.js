"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, get, activeState, newTrade, updateTrade, disabledState } = require("../controllers/TradeController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');
const { ExistsNewTrade } = require("../middlewares/ExistsNewTrade.js");

/**
 * Define las rutas relacionadas con los comercios.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    /**
    * Ruta para obtener todos los comercios.
    * 
    * @name GET /trade
    * @function
    * @memberof module:routes/trade
    * @returns {JSON} Respuesta con la lista de comercios o un error si no hay datos.
    */
    router.get("/trade", getAll);

    /**
   * Ruta para obtener un comercio específico asociado a un contribuyente.
   * 
   * @name GET /trade/:id
   * @function
   * @memberof module:routes/trade
   * @param {string} id - ID del contribuyente.
   * @returns {JSON} Respuesta con los datos del comercio asociado o un error si no existen registros.
   */
    router.get("/trade/:id", get);

    /**
   * Actualiza el estado de un comercio y emite un evento.
   * @name PUT /trade/:id
   * @function
   * @memberof module:routes/trade
   * @param {string} id - ID del comercio.
   * @param {Object} req - Objeto de solicitud HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
   * @returns {JSON} Mensaje de éxito o error en caso de fallo.
   */
    router.put("/trade/:id", AuthMiddleware, (req, res) => activeState(req, res, io));

    /**
    * Actualiza el estado de un comercio y emite un evento.
    * @name PUT /trade/:id
    * @function
    * @memberof module:routes/trade
    * @param {string} id - ID del comercio.
    * @param {Object} req - Objeto de solicitud HTTP.
    * @param {Object} res - Objeto de respuesta HTTP.
    * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
    * @returns {JSON} Mensaje de éxito o error en caso de fallo.
    */
    router.put("/trades/:id", AuthMiddleware, (req, res) => disabledState(req, res, io));

    /**
   * Actualiza los datos de un comercio y emite un evento.
   * @name PUT /trade/:id_trade/:id_taxpayer
   * @function
   * @memberof module:routes/trade
   * @param {string} id_trade - ID del comercio.
   * @param {string} id_taxpayer - ID del contribuyente.
   * @param {Object} req - Objeto de solicitud HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
   * @returns {JSON} Mensaje de éxito o error en caso de fallo.
   */
    router.put("/trade/:id_trade/:id_taxpayer", ExistsNewTrade, AuthMiddleware, (req, res) => updateTrade(req, res, io));

    /**
     * Persiste los datos de un nuevo comercio en la base de datos y emite un evento.
     * @name POST /trade
     * @function
     * @memberof module:routes/trade
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
     * @returns {JSON} Mensaje de éxito o error en caso de fallo.
     */
    router.post("/trade", ExistsNewTrade, AuthMiddleware, (req, res) => newTrade(req, res, io));

    return router;
};
