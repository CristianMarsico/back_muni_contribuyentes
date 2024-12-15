"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, get, activeState } = require("../controllers/TradeController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

// Rutas

module.exports = (io) => {

    router.get("/trade", getAll);
    router.get("/trade/:id", get);
    router.put("/trade/:id", (req, res) => activeState(req, res, io));

    return router;
};
