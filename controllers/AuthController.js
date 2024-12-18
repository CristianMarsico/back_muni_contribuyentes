"use strict";
const {
    register, addTrade, getUserWithRole, getTaxpayerWithRole
} = require('../models/AuthModel.js');

const {
    getRoleByName
} = require('../models/RolModel.js');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res, io) => {
    const { nombre, apellido, cuit, email, direccion, telefono, password, razon_social, misComercios } = req.body;

    const cuitConvert = convertStrigToNumber(`${cuit.prefijoCuit}${cuit.numeroCuit}${cuit.verificadorCuit}`)

    try {
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

exports.logout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.MODO !== 'developer', // Coincide con la configuración de creación
        sameSite: process.env.MODO !== 'developer' ? 'None' : 'Lax', // Coincide con la configuración de creación
    });
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

exports.getProtectedData = (req, res) => {    
    res.status(200).json({ user: req.user });
};

function convertStrigToNumber(text) {
    const number = BigInt(text); // Usamos BigInt
    return number; // Salida: 20123456785n
}