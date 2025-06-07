"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getNotifications, marcarLeida } = require("../controllers/NotificationController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas relacionadas con variables de configuracion (tasas, fechas, etc).
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    /**
  * Ruta para obtener todas las configuraciones.
  * 
  * <p>Esta ruta realiza una solicitud GET a /configuration y llama al 
  * controlador getAll para obtener las configuraciones almacenadas en la base de datos.</p>
  * 
  * @route {GET} /configuration
  * @returns {Object} Respuesta con el estado de la operación.
  *  - 200: Si se encuentran configuraciones.
  *  - 404: Si no hay configuraciones disponibles.
  *  - 500: Si ocurre un error en el servidor.
  */
    router.get("/notification", AuthMiddleware, getNotifications);

    /**
  * Ruta para marcar una notificación como leída.
  * 
  * @name PUT /notification/leida/:id
  * @function
  * @memberof module:routes/notification
  * @param {string} id - ID de la notificación.
  * @middleware AuthMiddleware - Requiere autenticación.
  * @returns {JSON} Respuesta confirmando que la notificación fue marcada como leída o un error.
  */
    router.put("/notification/leida/:id", AuthMiddleware, (req, res) => marcarLeida(req, res, io));

  
    return router;
};
