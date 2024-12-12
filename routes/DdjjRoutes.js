"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getByYearTradeBimester } = require("../controllers/DdjjController.js");

router.get("/ddjj/:id_taxpayer/:id_trade/:year/:bimester?", getByYearTradeBimester);

module.exports = router;