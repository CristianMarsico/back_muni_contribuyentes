"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, updateConfiguration } = require("../controllers/ConfigurationController.js");

router.get("/configuration", getAll);
router.put("/configuration/:id", updateConfiguration);

module.exports = router;