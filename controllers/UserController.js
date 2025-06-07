"use strict";
const {
    register, getAllUsers, deleteUser, updatePass, getUser, updateUser, getPass
} = require('../models/UserModel.js');

const {
    getRoleByName
} = require('../models/RolModel.js');

const bcrypt = require('bcrypt');

/**
 * Controlador para registrar un nuevo administrador.
 * 
 * Este controlador valida los datos, encripta la contraseña, registra al usuario en la base de datos, 
 * y emite un evento en tiempo real con los datos del nuevo administrador.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con los datos del nuevo administrador (`usuario`, `password`, `rePassword`).
 * @param {Object} res - Objeto de respuesta HTTP para devolver mensajes de éxito o error.
 * @param {Object} io - Objeto de WebSocket para emitir el evento `new-admin` con los datos del nuevo administrador.
 * 
 * @returns {Object} Respuesta con un mensaje de éxito y los datos del nuevo administrador o un mensaje de error si ocurre un fallo.
 * 
 * @throws {Error} "Las contraseñas no coinciden." - Si las contraseñas no coinciden.
 * @throws {Error} "No se pudo registrar el usuario." - Si ocurre un problema al registrar al usuario.
 * @throws {Error} "Error en el servidor." - Si ocurre un error inesperado en el servidor.
 * 
 * @example
 * // Uso en un endpoint
 * app.post('/register', register, (req, res) => {
 *   console.log('Registro exitoso');
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
 * Este controlador maneja la lógica para buscar todos los usuarios con el rol de "admin". 
 * Si se encuentran administradores registrados, se devuelve un código de estado 200 junto con los datos. 
 * Si no se encuentran administradores, se devuelve un código de estado 404 con un mensaje de error.
 * 
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * 
 * @returns {Object} Respuesta con los datos de los administradores o un mensaje de error.
 * 
 * @throws {Error} "Aún no se han registrado administradores." - Si no hay administradores en la base de datos.
 * @throws {Error} "Error de servidor." - Si ocurre un error durante el proceso.
 * 
 * @example
 * // Uso en una ruta:
 * app.get('/admins', getAllUsersController);
 */
exports.getAllUsers = async (req, res) => {
    try {
        const id_rol = await getRoleByName('admin');

        let response = await getAllUsers(id_rol[0].id_rol);
        if (response && response.length > 0)
            return res.status(200).json({ response });
        return res.status(404).json({ error: "Aún no se han registrado administradores" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para obtener usuarios según su rol.
 * 
 * Este controlador recibe un rol por parámetro y busca su ID correspondiente.
 * Luego, obtiene todos los usuarios asociados a ese rol.
 * 
 * @param {Object} req - Objeto de solicitud HTTP, con el parámetro `rol`.
 * @param {Object} res - Objeto de respuesta HTTP.
 * 
 * @returns {Object} - Respuesta JSON con los usuarios o un mensaje de error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.get('/user/admin', getUser);
 */
exports.getUser = async (req, res) => {
    const { rol } = req.params;    
    try {
        const id_rol = await getRoleByName(rol);

        let response = await getUser(id_rol[0].id_rol);
        if (response && response.length > 0)
            return res.status(200).json({ response });
        return res.status(404).json({ error: "No hay administrador" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para eliminar un usuario de la base de datos.
 * 
 * Este controlador maneja la solicitud para eliminar un usuario basado en su ID.
 * Si la eliminación es exitosa, se emite un evento con la ID del usuario eliminado y 
 * se devuelve un mensaje de éxito. Si no se puede eliminar el usuario, se devuelve un error.
 * 
 * @param {Object} req - El objeto de la solicitud que contiene el ID del usuario a eliminar.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Object} io - El objeto de la conexión de socket.io para emitir eventos.
 * 
 * @returns {JSON} Respuesta con un mensaje de éxito o un error.
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
 * @returns {JSON} Respuesta con un mensaje de éxito o un error.
 * 
 * @example
 * // Ejemplo de uso:
 * app.put('/user/:id/:pass', updatePassController);
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

/**
 * Controlador para actualizar los datos de un usuario.
 * 
 * Este controlador valida la contraseña actual del usuario antes de permitir la actualización.
 * Si la contraseña es correcta, encripta la nueva contraseña y actualiza los datos en la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP. Contiene el id en los parámetros y los nuevos datos en el cuerpo.
 * @param {Object} res - Objeto de respuesta HTTP. Devuelve el resultado de la operación.
 * 
 * @returns {Object} - Respuesta JSON indicando el resultado de la operación.
 * 
 * @example
 * // Ejemplo de solicitud:
 * PUT /user/5
 * {
 *   "usuario": "nuevo_usuario",
 *   "pass_actual": "mi_contraseña_actual",
 *   "pass_nueva": "mi_nueva_contraseña"
 * }
 */
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { usuario, pass_actual, pass_nueva } = req.body;
    try {
        const pass = await getPass(id)
        const isPasswordCorrect = await bcrypt.compare(pass_actual, pass[0].password);
      
        if (isPasswordCorrect) {
            const salt = await bcrypt.genSalt(8);
            const hashedPassword = await bcrypt.hash(pass_nueva, salt);
            // Llamar al modelo para actualizar la configuración
            const result = await updateUser(id, usuario, hashedPassword);

            // Si la actualización fue exitosa
            if (result.rowCount > 0) {
                return res.status(200).json({ message: 'Actualizado correctamente' });
            } else {
                return res.status(404).json({ error: 'Error al actualizar información' });
            }
        } else {
            return res.status(404).json({ error: "Contraseña no coincide" });
        }       
    } catch (error) {
        return res.status(500).json({ error: 'Error de servidor' });
    }
};