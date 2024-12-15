"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getByYearTradeMonth } = require("../controllers/DdjjController.js");

router.get("/ddjj/:id_taxpayer/:id_trade/:year/:month?", getByYearTradeMonth);

module.exports = router;