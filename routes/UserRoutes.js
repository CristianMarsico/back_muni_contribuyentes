"use strict";
const express = require('express');
const router = express.Router();

const { register, getAllAdmins, deleteUser } = require("../controllers/UserController.js");
const { ExistsUser } = require('../middlewares/ExistsUser.js');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas relacionadas a los usuarios.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    router.post("/user", AuthMiddleware, ExistsUser, (req, res) => register(req, res, io));
    router.get("/user", AuthMiddleware, getAllAdmins);
    router.delete("/user/:id", AuthMiddleware, (req, res) => deleteUser(req, res, io));

    return router;
};
