"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { register, loginAdmin, loginTaxpayer, logout, getProtectedData } = require("../controllers/AuthController.js");
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

const { ExistsTaxpayer } = require("../middlewares/ExistsTaxpayer.js");
const { ExistsTrade } = require("../middlewares/ExistsTrade.js");

module.exports = (io) => {
    /**
 * Ruta que maneja la solicitud POST para registrar un nuevo contribuyente.
 * Antes de llamar al controlador `register`, verifica si el contribuyente y el comercio existen.
 * 
 * @route POST /auth/register
 * @param {string} nombre - El nombre del contribuyente.
 * @param {string} apellido - El apellido del contribuyente.
 * @param {string} cuit - El número de CUIT del contribuyente.
 * @param {string} email - El correo electrónico del contribuyente.
 * @param {string} direccion - La dirección del contribuyente.
 * @param {string} telefono - El teléfono del contribuyente.
 * @param {string} password - La contraseña del contribuyente (será cifrada).
 * @param {string} razon_social - La razón social del contribuyente.
 * @param {array} misComercios - Lista de comercios que el contribuyente quiere agregar.
 * @returns {object} Respuesta con el estado del registro y el nuevo contribuyente.
 */
    router.post('/auth/register', ExistsTaxpayer, ExistsTrade, (req, res) => register(req, res, io));

    /**
  * Ruta para iniciar sesión como administrador.
  * @route POST /auth/login/admin
  * @param {Object} req - Objeto de solicitud, que contiene las credenciales del usuario.
  * @param {Object} res - Objeto de respuesta para devolver el resultado del login.
  */
    router.post('/auth/login/admin', loginAdmin);

    /**
     * Ruta para el inicio de sesión de contribuyentes.
     * 
     * @route POST /auth/login/taxpayer
     * @param {Object} req - La solicitud HTTP que contiene los datos del usuario (cuit y password).
     * @param {Object} res - La respuesta HTTP que envía el resultado del inicio de sesión (token de autenticación).
     */
    router.post('/auth/login/taxpayer', loginTaxpayer);

    /**
 * Ruta para cerrar la sesión del usuario.
 * 
 * @route POST /auth/logout
 * @param {Object} req - La solicitud HTTP, que no requiere datos adicionales.
 * @param {Object} res - La respuesta HTTP que indica si el cierre de sesión fue exitoso.
 */
    router.post("/auth/logout", logout);

    /**
 * Ruta para acceder a datos protegidos.
 * 
 * @route GET /auth/protected
 * @param {Object} req - La solicitud HTTP, que debe contener el token de autenticación en las cookies.
 * @param {Object} res - La respuesta HTTP que devuelve los datos protegidos del usuario autenticado.
 * @param {function} AuthMiddleware - Middleware de autenticación que verifica el token.
 */
    router.get("/auth/protected", AuthMiddleware, getProtectedData);

    return router;
};
