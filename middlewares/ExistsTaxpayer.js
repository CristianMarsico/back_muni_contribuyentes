"use strict";
const {conn} = require('../dataBase/Connection.js');

/**
 * Middleware para verificar si el CUIT del contribuyente ya está registrado.
 * 
 * Convierte el CUIT proporcionado a un número y verifica si ya está registrado en la base de datos.
 * Si el CUIT ya existe, se retorna un error indicando que ya está registrado.
 * Si no existe, se pasa al siguiente middleware.
 * 
 * @function ExistsTaxpayer
 * 
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 * 
 * @returns {Object} Respuesta con el estado de la verificación o un error.
 */
exports.ExistsTaxpayer = (req, res, next) => {
    const { cuit } = req.body; 
    const cuitConvert = convertStrigToNumber(`${cuit.prefijoCuit}${cuit.numeroCuit}${cuit.verificadorCuit}`)
    
    const sql = `SELECT 1 FROM CONTRIBUYENTE WHERE cuit = $1`;
    conn.query(sql, [cuitConvert], (err, results) => {       
        if (err) return res.status(500).json({ error: 'Error de servidor' });
        if (results.rows.length > 0){           
            return res.status(404).json({ error: 'Ese CUIT ya figura registrado' });
        }
        return next();
    });
};

function convertStrigToNumber(text) {
    const number = BigInt(text); // Usamos BigInt
    return number; // Salida: 20123456785n
}
