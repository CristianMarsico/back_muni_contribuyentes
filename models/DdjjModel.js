"use strict";
const conn = require('../dataBase/Connection.js');

exports.getByYearTradeMonth = (id_taxpayer, id_trade, year, month) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM ddjj WHERE id_contribuyente = $1 AND id_comercio = $2 AND EXTRACT(YEAR FROM fecha) = $3';
        const values = [id_taxpayer, id_trade, year];       
        
        if (month) {
            query += ' AND EXTRACT(MONTH FROM fecha) = $4';
            values.push(month);
        }       
        
        conn.query(query, values, (err, resultados) => {          
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};