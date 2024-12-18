"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, updateConfiguration } = require("../controllers/ConfigurationController.js");


module.exports = (io) => {
    router.get("/configuration", getAll);
    router.put("/configuration/:id", (req, res) => updateConfiguration(req, res, io));
    return router;
};
