"use strict";
const {
    register
} = require('../models/UserModel.js');

const {
    getRoleByName
} = require('../models/RolModel.js');

const bcrypt = require('bcrypt');

/**
 * Controlador que maneja el registro de un nuevo usuario.
 * Realiza la validación de los datos, la creación del usuario y la asociación a un rol.
 * 
 * @async
 * @function register
 * @param {Object} req - El objeto de solicitud HTTP que contiene los datos del formulario de registro.
 * @param {Object} res - El objeto de respuesta HTTP para enviar una respuesta al cliente.
 * @param {Object} io - El objeto Socket.io para emitir eventos en tiempo real.
 * @returns {Object} Respuesta HTTP con el estado de la operación.
 */
exports.register = async (req, res) => {
    const { usuario, password, rePassword } = req.body;

    try {
        if (password !== rePassword){
            return res.status(404).json({ error: 'Las contraseñas no coinciden.' });
        }
        const id_rol = await getRoleByName('admin');

        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Ahora la función devuelve todos los datos del admin
        const nuevoAdmin = await register(
            usuario,
            hashedPassword,
            id_rol[0].id_rol
        );

        if (!nuevoAdmin) return res.status(404).json({ error: 'No se pudo registrar el usuario.' });
        // Emitir el nuevo contribuyente con todos sus datos
        //io.emit('nuevo-contribuyente', nuevoContribuyente);

        return res.status(200).json({ message: 'Usuario registrado exitosamente.', data: nuevoAdmin });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};