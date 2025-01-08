"use strict";
const {
    register, getAllAdmins, deleteUser, updatePass
} = require('../models/UserModel.js');

const {
    getRoleByName
} = require('../models/RolModel.js');

const bcrypt = require('bcrypt');

/**
 * Controlador para registrar un nuevo administrador.
 * 
 * Este controlador permite registrar un nuevo usuario con un rol de administrador. Verifica si las contraseñas coinciden,
 * encripta la contraseña antes de almacenarla, y asigna el rol adecuado al usuario. Luego, emite un evento de WebSocket 
 * con los datos del nuevo administrador y responde con un mensaje de éxito.
 * 
 * @param {Object} req - El objeto de solicitud HTTP, que contiene el cuerpo con los datos del nuevo usuario (`usuario`, `password`, `rePassword`).
 * @param {Object} res - El objeto de respuesta HTTP, utilizado para devolver mensajes de éxito o error.
 * @param {Object} io - El objeto de WebSocket, utilizado para emitir el evento `new-admin` con los datos del nuevo administrador.
 * 
 * @returns {Object} - Respuesta con un mensaje de éxito y los datos del nuevo administrador o un mensaje de error si no se pudo registrar.
 * 
 * @example
 * // Ejemplo de uso:
 * app.post('/register', register, (req, res) => {
 *   // Lógica después del registro
 * });
 */
exports.register = async (req, res, io) => {
    const { usuario, password, rePassword } = req.body;
    try {
        if (password !== rePassword) return res.status(404).json({ error: 'Las contraseñas no coinciden.' });
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
        io.emit('new-admin', nuevoAdmin);
        return res.status(200).json({ message: 'Usuario registrado exitosamente.', data: nuevoAdmin });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Controlador para obtener todos los administradores registrados en la base de datos.
 * 
 * Este controlador maneja la solicitud para obtener todos los usuarios con el rol de "admin". Si se encuentran administradores, 
 * los devuelve en la respuesta con un código de estado 200. Si no se encuentran administradores registrados, 
 * se devuelve un mensaje de error con un código de estado 404.
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * 
 * @returns {Object} - Respuesta con los datos de los administradores o un error si no se encuentran administradores.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/admins', getAllAdminsController);
 */
exports.getAllAdmins = async (req, res) => {
    try {
        const id_rol = await getRoleByName('admin');

        let response = await getAllAdmins(id_rol[0].id_rol);
        if (response && response.length > 0)
            return res.status(200).json({ response });
        return res.status(404).json({ error: "Aún no se han registrado administradores" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para eliminar un administrador de la base de datos.
 * 
 * Este controlador maneja la solicitud para eliminar un administrador basado en su ID. 
 * Si la eliminación es exitosa, se emite un evento con la ID del administrador eliminado y 
 * se devuelve un mensaje de éxito. Si no se puede eliminar el administrador, se devuelve un error.
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Object} io - El objeto de la conexión de socket.io para emitir eventos.
 * 
 * @returns {Object} - Respuesta con un mensaje de éxito o un error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.delete('/user/:id', deleteUserController);
 */
exports.deleteUser = async (req, res, io) => {
    const { id } = req.params;
    try {
        let id_deleted = await deleteUser(id, res)
        if (id_deleted) {
            io.emit('deleted_admin', id_deleted);
            return res.status(200).json({ message: `Administrador borrado con éxito` });
        }
        else return res.status(404).json({ error: "Error: No se ha podido eliminar" })
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para actualizar la contraseña de un usuario.
 * 
 * Este controlador maneja la solicitud para actualizar la contraseña de un usuario basado en su ID.
 * La nueva contraseña se encripta utilizando bcrypt antes de ser almacenada en la base de datos.
 * Si la actualización es exitosa, se devuelve un mensaje de éxito. Si ocurre un error, se maneja adecuadamente.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene los parámetros `id` y `pass`.
 * @param {Object} res - El objeto de la respuesta utilizado para devolver el mensaje de éxito o error.
 * 
 * @returns {Object} - Respuesta con un mensaje de éxito o un error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/user/password/:id/:pass', updatePassController);
 */
exports.updatePass = async (req, res) => {
    const { id, pass } = req.params;

    try {
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(pass, salt);
        // Llamar al modelo para actualizar la configuración
        const result = await updatePass(id, hashedPassword);

        // Si la actualización fue exitosa
        if (result.rowCount > 0) {
            return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        } else {
            return res.status(404).json({ error: 'Error al actualizar la contraseña' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error de servidor' });
    }
};