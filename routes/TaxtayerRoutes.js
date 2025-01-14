"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, editActive, getWithTrade } = require("../controllers/TaxpayerController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas para gestionar los contribuyentes.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {

  /**
   * Ruta para obtener todos los contribuyentes.
   *
   * @name GET /taxpayer
   * @function
   * @returns {JSON} Respuesta con todos los contribuyentes o un mensaje de error.
   */
  router.get("/taxpayer", AuthMiddleware, getAll);

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
  */
  router.put("/taxpayer/:id", AuthMiddleware,(req, res) => editActive(req, res, io));

  /**
  * Ruta para obtener un contribuyente y sus comercios asociados.
  *
  * @name GET /taxpayer/:id
  * @function
  * @param {string} id - ID del contribuyente (como parámetro en la URL).
  * @param {Object} req - Objeto de solicitud HTTP.
  * @param {Object} res - Objeto de respuesta HTTP.
  * @returns {JSON} Respuesta con los datos del contribuyente y sus comercios o un mensaje de error.
  */
  router.get("/taxpayer/:id", AuthMiddleware, getWithTrade);

  return router;
};
