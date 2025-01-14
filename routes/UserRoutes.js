"use strict";
const express = require('express');
const router = express.Router();

const { register, getAllAdmins, deleteUser, updatePass } = require("../controllers/UserController.js");
const { ExistsUser } = require('../middlewares/ExistsUser.js');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

/**
 * Define las rutas relacionadas a los usuarios.
 * 
 * @param {object} io - Instancia de Socket.io.
 * @returns {import('express').Router} Router con las rutas definidas.
 */
module.exports = (io) => {
    
    /**
     * Persiste los datos de un nuevo administrador en la base de datos y emite un evento.
     * 
     * Este endpoint permite registrar un nuevo administrador en la base de datos. 
     * También emite un evento en tiempo real utilizando Socket.io.
     * 
     * @name POST /user
     * @function
     * @memberof module:routes/user
     * @param {Object} req - Objeto de solicitud HTTP que contiene los datos del administrador (`usuario`, `password`, `rePassword`).
     * @param {Object} res - Objeto de respuesta HTTP utilizado para devolver un mensaje de éxito o error.
     * @param {Object} io - Objeto de WebSocket para emitir eventos.
     * 
     * @returns {Object} Respuesta con un mensaje de éxito y los datos del nuevo administrador o un mensaje de error si ocurre un fallo.
     * 
     * @example
     * // Petición POST
     * fetch('/user', {
     *   method: 'POST',
     *   body: JSON.stringify({
     *     usuario: 'admin',
     *     password: '123456',
     *     rePassword: '123456'
     *   }),
     *   headers: { 'Content-Type': 'application/json' }
     * }).then(response => response.json())
     *   .then(data => console.log(data));
     */
    router.post("/user", AuthMiddleware, ExistsUser, (req, res) => register(req, res, io));

    /**
     * Obtiene todos los usuarios administradores.
     * 
     * Este endpoint permite obtener la lista de usuarios registrados con el rol de "admin". 
     * Solo se puede acceder a esta ruta si el usuario está autenticado mediante un token.
     * 
     * @name GET /user
     * @function
     * @memberof module:routes/user
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     * 
     * @returns {Object} Respuesta con la lista de administradores o un mensaje de error.
     * 
     * @example
     * // Ejemplo de solicitud GET
     * fetch('/user', {
     *   method: 'GET',
     *   headers: {
     *     'Authorization': 'Bearer <token>',
     *     'Content-Type': 'application/json'
     *   }
     * }).then(response => response.json())
     *   .then(data => console.log(data));
     */
    router.get("/user", AuthMiddleware, getAllAdmins);

    /**
     * Elimina un usuario específico de la base de datos.
     * 
     * Esta ruta permite eliminar un usuario basado en su ID. Si la eliminación es exitosa, 
     * se emite un evento con la ID del usuario eliminado y se devuelve un mensaje de éxito.
     * Si ocurre un error o el usuario no se encuentra, se devuelve un mensaje de error.
     * 
     * @name DELETE /user/:id
     * @function
     * @memberof module:routes/user
     * @param {string} id - ID del usuario a eliminar.
     * @returns {JSON} Respuesta con un mensaje de éxito o un error.
     * 
     * @example
     * // Ejemplo de uso:
     * app.delete('/user/:id', deleteUserController);
     */
    router.delete("/user/:id", AuthMiddleware, (req, res) => deleteUser(req, res, io));

    /**
    * Ruta para actualizar la contraseña de un usuario.
    * 
    * Esta ruta permite actualizar la contraseña de un usuario en base a su ID.
    * La nueva contraseña debe ser proporcionada como parámetro.
    * 
    * @name PUT /user/:id/:pass
    * @function
    * @memberof module:routes/user
    * @param {string} id - ID del usuario cuyo password será actualizado.
    * @param {string} pass - Nueva contraseña del usuario, la cual será encriptada antes de almacenarse.
    * @returns {JSON} Respuesta con un mensaje de éxito o error si la actualización falla.
    * 
    * @example
    * // Ejemplo de uso:
    * app.put('/user/:id/:pass', updatePassController);
    */
    router.put("/user/:id/:pass", AuthMiddleware, updatePass);

    return router;
};
