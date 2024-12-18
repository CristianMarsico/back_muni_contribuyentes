"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, updateExipirationDate } = require("../controllers/ExpirationDatesController.js");

module.exports = (io) => {
    router.get("/expirationDates", getAll);
    router.put("/expirationDates/:id/:date", (req, res) => updateExipirationDate(req, res, io));
    return router;
};
