"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, get } = require("../controllers/TradeController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

// Rutas
router.get("/trade", getAll);
router.get("/trade/:id", get);

module.exports = router;