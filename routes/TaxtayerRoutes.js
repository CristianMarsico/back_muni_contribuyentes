"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, editActive, getWithTrade, deleteTaxpayer, editGoodTaxpayer } = require("../controllers/TaxpayerController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');
const { UploadedDDJJ } = require('../middlewares/UploadedDDJJ.js');

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
  router.put("/taxpayer/:id", AuthMiddleware, (req, res) => editActive(req, res, io));

  /**
 * Ruta para actualizar el estado de "buen contribuyente" de un contribuyente.
 *
 * @route {PUT} /taxpayer/:id/goodTaxpayer
 * @middleware {AuthMiddleware} - Verifica la autenticación del usuario.
 * @param {number} id - ID del contribuyente.
 * @body {boolean|string} newEstado - Nuevo estado del contribuyente.
 */
  router.put("/taxpayer/:id/goodTaxpayer", AuthMiddleware, (req, res) => editGoodTaxpayer(req, res, io));

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

  /**
 * Ruta para eliminar un contribuyente.
 *
 * @route {DELETE} /taxpayer/:id
 * @middleware {AuthMiddleware} - Verifica la autenticación del usuario.
 * @middleware {UploadedDDJJ} - Verifica si el contribuyente tiene DDJJ cargadas.
 * @param {number} id - ID del contribuyente a eliminar.
 */
  router.delete("/taxpayer/:id", AuthMiddleware, UploadedDDJJ, (req, res) => deleteTaxpayer(req, res, io));

  return router;
};
