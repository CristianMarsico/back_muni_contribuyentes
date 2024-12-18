"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getByYearTradeMonth, addDdjj } = require("../controllers/DdjjController.js");
const { ExistsDDJJ } = require('../middlewares/ExistsDDJJ.js');
router.get("/ddjj/:id_taxpayer/:id_trade/:year/:month?", getByYearTradeMonth);
router.post("/ddjj", ExistsDDJJ, addDdjj);

module.exports = router;