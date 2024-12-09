"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { register, loginAdmin, loginTaxpayer, logout, getProtectedData } = require("../controllers/AuthController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');


const { ExistsTaxpayer } = require("../middlewares/ExistsTaxpayer.js")
const { ExistsTrade } = require("../middlewares/ExistsTrade.js")

// Rutas
router.post('/auth/register', ExistsTaxpayer, ExistsTrade, register);
router.post('/auth/login/admin', loginAdmin);
router.post('/auth/login/taxpayer',loginTaxpayer);
router.post("/auth/logout", logout);
router.get("/auth/protected", AuthMiddleware, getProtectedData);

module.exports = router;