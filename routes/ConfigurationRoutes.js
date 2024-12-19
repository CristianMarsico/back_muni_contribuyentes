"use strict";
const express = require('express');
const router = express.Router();

//HACEMOS USO DE LOS CONTROLADORES
const { getAll, updateConfiguration } = require("../controllers/ConfigurationController.js");


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
    router.get("/configuration", getAll);

    /**
 * Ruta para actualizar una configuración existente.
 * 
 * <p>Esta ruta realiza una solicitud PUT a /configuration/:id y llama al 
 * controlador updateConfiguration, pasando los parámetros de la solicitud 
 * para actualizar una configuración específica en la base de datos.</p>
 * 
 * @route {PUT} /configuration/:id
 * @param {string} id - El ID de la configuración a actualizar.
 * @param {Object} body - El cuerpo de la solicitud, con los parámetros de configuración a actualizar.
 * @returns {Object} Respuesta con el estado de la operación.
 *  - 200: Si la actualización es exitosa.
 *  - 404: Si no se pudo actualizar la configuración.
 *  - 500: Si ocurre un error en el servidor.
 */
    router.put("/configuration/:id", (req, res) => updateConfiguration(req, res, io));
    return router;
};
