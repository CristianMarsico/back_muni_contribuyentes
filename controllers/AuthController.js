"use strict";
const {
    register, getUserWithRole,
    getTaxpayerWithRole, saveResetCode, verifyResetCode,
    updatePassword
} = require('../models/AuthModel.js');

const {
    getRoleByName
} = require('../models/RolModel.js');

const {
    addTrade
} = require('../models/TradeModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

/**
 * Controlador para registrar un nuevo contribuyente.
 * 
 * Este controlador procesa la solicitud de registro de un contribuyente, valida los datos,
 * encripta la contraseña, almacena la información en la base de datos y asocia los comercios si se proporcionan.
 * Además, emite un evento en tiempo real con los datos del nuevo contribuyente.
 * 
 * @async
 * @function register
 * @param {Object} req - Objeto de solicitud de Express, que contiene los datos del cuerpo de la solicitud.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * @param {Object} io - Instancia de Socket.IO para emitir eventos en tiempo real.
 * 
 * @returns {void}
 * 
 * @example
 * // Ejemplo de uso:
 * const req = {
 *   body: {
 *     nombre: 'Juan',
 *     apellido: 'Pérez',
 *     cuit: { prefijoCuit: '20', numeroCuit: '12345678', verificadorCuit: '9' },
 *     email: 'juan.perez@example.com',
 *     direccion: 'Calle Falsa 123',
 *     telefono: '123456789',
 *     password: 'password123',
 *     rePassword: 'password123',
 *     razon_social: 'Negocio de Juan',
 *     misComercios: ['Comercio 1', 'Comercio 2']
 *   }
 * };
 * const res = { status: () => ({ json: console.log }) };
 * register(req, res, io);
 */
exports.register = async (req, res, io) => {
    const { nombre, apellido, cuit, email, direccion, telefono, password, rePassword, razon_social, misComercios } = req.body;

    const cuitConvert = convertStrigToNumber(`${cuit.prefijoCuit}${cuit.numeroCuit}${cuit.verificadorCuit}`)

    try {
        if (password !== rePassword) return res.status(404).json({ error: 'Las contraseñas no coinciden.' });

        const id_rol = await getRoleByName('user');

        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Ahora la función devuelve todos los datos del contribuyente
        const nuevoContribuyente = await register(
            nombre,
            apellido,
            cuitConvert,
            email,
            direccion,
            telefono,
            hashedPassword,
            razon_social,
            false, // estado inicial del contribuyente (en espera)
            id_rol[0].id_rol
        );

        if (!nuevoContribuyente) return res.status(404).json({ error: 'No se pudo registrar el contribuyente.' });

        // Agregar los comercios si existen
        if (misComercios && misComercios.length > 0) {
            const comerciosAgregados = await addTrade(misComercios, nuevoContribuyente.id_contribuyente);
            if (!comerciosAgregados) {
                return res.status(404).json({ error: 'Error al agregar los comercios.' });
            }
        }

        // Emitir el nuevo contribuyente con todos sus datos
        io.emit('nuevo-contribuyente', nuevoContribuyente);

        return res.status(200).json({ message: 'Contribuyente registrado y comercios agregados exitosamente.', data: nuevoContribuyente });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Controlador para el inicio de sesión de administradores.
 * 
 * Este controlador verifica las credenciales de un administrador, genera un token de autenticación 
 * si las credenciales son válidas y configura una cookie con el token. También incluye medidas de seguridad
 * para proteger la cookie contra accesos no autorizados.
 * 
 * @async
 * @function loginAdmin
 * @param {Object} req - Objeto de solicitud de Express, que contiene los datos del cuerpo de la solicitud.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * 
 * @returns {void}
 * 
 * @example
 * // Ejemplo de uso:
 * const req = {
 *   body: {
 *     username: 'admin',
 *     password: 'adminPassword123'
 *   }
 * };
 * const res = { 
 *   status: () => ({ json: console.log, cookie: console.log }) 
 * };
 * loginAdmin(req, res);
 */
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const resp = await getUserWithRole(username);

        // Verificar si se encontró el usuario
        if (resp.length === 0) return res.status(404).json({ error: "Usuario o contraseña incorrectos" });

        const usuario = resp[0]; // Primer resultado de la consulta
        const rol = usuario.rol; // El nombre del rol ya está en el resultado

        const isPasswordCorrect = await bcrypt.compare(password, usuario.password);
        if (!isPasswordCorrect) return res.status(404).json({ error: "Usuario o contraseña incorrectos" });

        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                nombre: usuario.usuario,
                rol: rol,
            },
            process.env.SECRET_KEY, // Clave secreta para firmar el token
            { expiresIn: '1d' } // El token expirará en 1 día
        );

        // Configurar la cookie con el token
        res.cookie('authToken', token, {
            httpOnly: true, // Protege la cookie contra acceso desde JavaScript
            secure: process.env.MODO !== 'developer', // Solo enviar en HTTPS fuera de desarrollo
            sameSite: process.env.MODO !== 'developer' ? 'None' : 'Lax', // Permitir cookies en peticiones cruzadas en producción, // Previene ataques CSRF
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            id: usuario.id_usuario,
            nombre: usuario.usuario,
            rol: rol,
            token
        });

    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para el inicio de sesión de contribuyentes.
 * 
 * Este controlador verifica las credenciales de un contribuyente (CUIT y contraseña), genera un token 
 * de autenticación si las credenciales son válidas y configura una cookie con el token. 
 * También incluye medidas de seguridad para proteger la cookie.
 * 
 * @async
 * @function loginTaxpayer
 * @param {Object} req - Objeto de solicitud de Express, que contiene los datos del cuerpo de la solicitud.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * 
 * @returns {void}
 * 
 * @example
 * // Ejemplo de uso:
 * const req = {
 *   body: {
 *     cuit: { 
 *       prefijoCuit: '20', 
 *       numeroCuit: '12345678', 
 *       verificadorCuit: '3' 
 *     },
 *     password: 'securePassword123'
 *   }
 * };
 * const res = { 
 *   status: () => ({ json: console.log, cookie: console.log }) 
 * };
 * loginTaxpayer(req, res);
 */
exports.loginTaxpayer = async (req, res) => {

    const { cuit, password } = req.body;
    const cuitConvert = convertStrigToNumber(`${cuit.prefijoCuit}${cuit.numeroCuit}${cuit.verificadorCuit}`)

    try {
        const resp = await getTaxpayerWithRole(cuitConvert);

        // Verificar si se encontró el usuario
        if (resp.length === 0) return res.status(404).json({ error: "CUIT o contraseña incorrectos" });

        const usuario = resp[0]; // Primer resultado de la consulta
        const rol = usuario.rol; // El nombre del rol ya está en el resultado

        const isPasswordCorrect = await bcrypt.compare(password, usuario.password);
        if (!isPasswordCorrect) return res.status(404).json({ error: "CUIT o contraseña incorrectos" });

        const token = jwt.sign(
            {
                id: usuario.id_contribuyente,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                cuit: usuario.cuit,
                rol: rol,
                estado: usuario.estado,
            },
            process.env.SECRET_KEY, // Clave secreta para firmar el token
            { expiresIn: '1d' } // El token expirará en 1 día
        );

        // Configurar la cookie con el token
        res.cookie('authToken', token, {
            httpOnly: true, // Protege la cookie contra acceso desde JavaScript
            secure: process.env.MODO !== 'developer', // Solo enviar en HTTPS fuera de desarrollo
            sameSite: process.env.MODO !== 'developer' ? 'None' : 'Lax', // Permitir cookies en peticiones cruzadas en producción, // Previene ataques CSRF
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            id: usuario.id_contribuyente,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            cuit: usuario.cuit,
            rol: rol,
            estado: usuario.estado,
            token
        });

    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

/**
 * Controlador para cerrar sesión.
 * 
 * Este controlador elimina la cookie de autenticación (`authToken`) del cliente, 
 * asegurando que ya no pueda realizar solicitudes autenticadas. La configuración de la cookie 
 * coincide con la utilizada en la creación para garantizar su eliminación correcta.
 * 
 * @function logout
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * 
 * @returns {void}
 * 
 * @example
 * // Ejemplo de uso:
 * const req = {};
 * const res = { 
 *   clearCookie: console.log, 
 *   status: () => ({ json: console.log }) 
 * };
 * logout(req, res);
 */
exports.logout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.MODO !== 'developer', // Coincide con la configuración de creación
        sameSite: process.env.MODO !== 'developer' ? 'None' : 'Lax', // Coincide con la configuración de creación
    });
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

/**
 * Controlador para obtener datos protegidos.
 * 
 * Este controlador devuelve los datos del usuario autenticado que se almacenan en `req.user`, 
 * generalmente configurados por un middleware de autenticación. Los datos protegidos solo son accesibles 
 * si el usuario ha iniciado sesión correctamente.
 * 
 * @function getProtectedData
 * @param {Object} req - Objeto de solicitud de Express, que contiene los datos del usuario autenticado en `req.user`.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * 
 * @returns {void}
 * 
 * @example
 * // Ejemplo de uso:
 * const req = { user: { id: 1, nombre: "Juan", rol: "admin" } };
 * const res = { 
 *   status: (code) => ({ json: (data) => console.log(code, data) })
 * };
 * getProtectedData(req, res);
 * // Salida esperada: 200 { user: { id: 1, nombre: "Juan", rol: "admin" } }
 */
exports.getProtectedData = (req, res) => {
    res.status(200).json({ user: req.user });
};

/**
 * Controlador para enviar un código de recuperación de contraseña por correo electrónico.
 * 
 * Este controlador genera un código de recuperación de 4 dígitos, lo almacena en la base de datos junto con su tiempo de expiración,
 * y envía un correo al usuario con el código de recuperación.
 * 
 * @function sendResetCode
 * @param {Object} req - Objeto de solicitud de Express, que contiene el correo electrónico del usuario en `req.body.email`.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * 
 * @returns {void}
 * 
 * @example
 * // Ejemplo de uso:
 * req.body = { email: "usuario@example.com" };
 * sendResetCode(req, res);
 * // Salida esperada: 200 { message: "Revise su correo. El código ha sido enviado." }
 * 
 * @throws {Error} Si ocurre un error durante el proceso de generación, almacenamiento o envío del código.
 */
exports.sendResetCode = async (req, res) => {
    const { email } = req.body;
    try {
        // Generar un código de 4 dígitos
        const resetCode = Math.floor(1000 + Math.random() * 9000);

        // Guardar el código y la expiración en la base de datos
        await saveResetCode(email, resetCode);

        // Configurar y enviar el correo
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Código de recuperación de contraseña",
            text: `Tu código de recuperación es: ${resetCode}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Revise su correo. El código ha sido enviado." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al enviar el código." });
    }
};

/**
 * Controlador para restablecer la contraseña de un usuario.
 * 
 * Este controlador verifica un código de restablecimiento enviado previamente al correo electrónico, 
 * valida la expiración del código, y actualiza la contraseña del usuario en la base de datos.
 * 
 * @function resetPassword
 * @param {Object} req - Objeto de solicitud de Express, que contiene `email`, `code` y `newPassword` en el cuerpo de la solicitud.
 * @param {Object} res - Objeto de respuesta de Express para enviar respuestas al cliente.
 * 
 * @returns {void}
 * 
 * @throws {Error} Si ocurre un error al verificar el código o actualizar la contraseña.
 */
exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;   
    try {      
        const user = await verifyResetCode(email, code);
        if (user.length === 0) return res.status(400).json({ error: "Código inválido o expirado." });

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // // Actualizar la contraseña en la base de datos
        const updatedPass = updatePassword(email, hashedPassword);
        if (!updatedPass) return res.status(404).json({ error: "No fue posible cambiar la contraseña." });

        return res.status(200).json({
            message: "Contraseña modificada con éxito",
            data: updatedPass
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la contraseña." });
    }
};

/**
 * Convierte una cadena de texto a un número tipo BigInt.
 * Esto es útil para manejar números grandes que superan el límite de los números enteros regulares.
 * @function
 * @param {string} text - La cadena de texto que representa un número grande.
 * @returns {BigInt} - El número convertido a tipo BigInt.
 * @example
 * // Entrada: "20123456785"
 * // Salida: 20123456785n
 */
function convertStrigToNumber(text) {
    const number = BigInt(text); // Usamos BigInt
    return number; // Salida: 20123456785n
}