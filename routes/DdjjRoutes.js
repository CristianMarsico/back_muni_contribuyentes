"use strict";
const express = require('express');
const router = express.Router();

const { getByYearTradeMonth, addDdjj } = require("../controllers/DdjjController.js");
const { ExistsDDJJ } = require('../middlewares/ExistsDDJJ.js');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');


module.exports = (io) => {
    /**
    * Ruta para obtener las DDJJ según el contribuyente, comercio, año y mes.
    * 
    * @route GET /ddjj/:id_taxpayer/:id_trade/:year/:month?
    * @param {string} id_taxpayer - ID del contribuyente.
    * @param {string} id_trade - ID del comercio.
    * @param {string} year - Año de la DDJJ.
    * @param {string} [month] - Mes de la DDJJ (opcional).
    * @returns {object} 200 - Objeto con las DDJJ encontradas.
    * @returns {object} 404 - Error si no se encuentran DDJJ para el mes o año.
    */
    router.get("/ddjj/:id_taxpayer/:id_trade/:year/:month?", AuthMiddleware, getByYearTradeMonth);

    /**
     * Ruta para agregar una nueva DDJJ.
     * 
     * @route POST /ddjj
     * @param {object} body - Datos de la nueva DDJJ.
     * @param {string} body.id_contribuyente - ID del contribuyente.
     * @param {string} body.id_comercio - ID del comercio.
     * @param {number} body.monto - Monto de la DDJJ.
     * @param {string} body.descripcion - Descripción de la DDJJ.
     * @returns {object} 200 - Mensaje de éxito y datos de la nueva DDJJ.
     * @returns {object} 404 - Error si no se puede agregar la DDJJ.
     * @returns {object} 500 - Error de servidor.
     */
    router.post("/ddjj", ExistsDDJJ, (req, res) => addDdjj(req, res, io));

    return router;
};