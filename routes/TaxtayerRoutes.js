"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, editActive } = require("../controllers/TaxpayerController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

// Rutas
router.get("/taxpayer", AuthMiddleware, getAll);
router.put("/taxpayer/:id", editActive);

module.exports = router;