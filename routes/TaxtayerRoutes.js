"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, editActive, getWithTrade } = require("../controllers/TaxpayerController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

// Rutas
module.exports = (io) => {
    router.get("/taxpayer", getAll);
    router.put("/taxpayer/:id", (req, res) => editActive(req, res, io));
    router.get("/taxpayer/:id", getWithTrade);
    return router;
};
