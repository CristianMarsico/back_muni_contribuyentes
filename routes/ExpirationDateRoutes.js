"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll } = require("../controllers/ExpirationDatesController.js");

router.get("/expirationDates", getAll);

module.exports = router;