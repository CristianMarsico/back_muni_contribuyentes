"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, editActive, getWithTrade } = require("../controllers/TaxpayerController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas para gestionar los contribuyentes.
 *
 * @module RutasTaxpayer
 * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
 * @returns {Object} router - Router configurado con las rutas definidas.
 */
module.exports = (io) => {
    /**
   * Ruta para obtener todos los contribuyentes.
   *
   * @name GET /taxpayer
   * @function
   * @returns {JSON} Respuesta con todos los contribuyentes o un mensaje de error.
   * @throws {Error} 404 - Si no hay contribuyentes en la base de datos.
   * @throws {Error} 500 - Si ocurre un error en el servidor.
   */
    router.get("/taxpayer", getAll);

    /**
  * Ruta para actualizar el estado de un contribuyente.
  *
  * @name PUT /taxpayer/:id
  * @function
  * @param {string} id - ID del contribuyente a actualizar (como parámetro en la URL).
  * @param {Object} req - Objeto de solicitud HTTP.
  * @param {Object} res - Objeto de respuesta HTTP.
  * @param {Object} io - Objeto de Socket.io para emitir eventos en tiempo real.
  * @returns {JSON} Respuesta con el estado actualizado o un mensaje de error.
  * @throws {Error} 400 - Si no se proporciona un ID válido.
  * @throws {Error} 404 - Si el contribuyente no se encuentra o no se pudo actualizar.
  * @throws {Error} 500 - Si ocurre un error en el servidor.
  */
    router.put("/taxpayer/:id", (req, res) => editActive(req, res, io));

    /**
  * Ruta para obtener un contribuyente y sus comercios asociados.
  *
  * @name GET /taxpayer/:id
  * @function
  * @param {string} id - ID del contribuyente (como parámetro en la URL).
  * @param {Object} req - Objeto de solicitud HTTP.
  * @param {Object} res - Objeto de respuesta HTTP.
  * @returns {JSON} Respuesta con los datos del contribuyente y sus comercios o un mensaje de error.
  * @throws {Error} 404 - Si no hay comercios asociados al contribuyente.
  * @throws {Error} 500 - Si ocurre un error en el servidor.
  */
    router.get("/taxpayer/:id", getWithTrade);
    return router;
};
