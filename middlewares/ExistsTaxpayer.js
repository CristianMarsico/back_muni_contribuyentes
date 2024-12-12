"use strict";
const conn = require('../dataBase/Connection.js');

/**
 * Middleware que verifica si el CUIT de un contribuyente ya existe en la base de datos.
 * @param {object} req - El objeto de solicitud HTTP que contiene los parámetros de la ruta.
 * @param {object} res - El objeto de respuesta HTTP.
 * @param {function} next - Función para pasar el control al siguiente middleware o ruta.
 *
 * @throws {Error} Si hay un error en la consulta de la base de datos.
 *
 * Si el cuit especificado existe en la base de datos, responde con un código de estado 404 y un mensaje de error.
 * Si no existe, llama a la función `next` para permitir que la solicitud continúe.
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
