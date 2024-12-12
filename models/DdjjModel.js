"use strict";
const conn = require('../dataBase/Connection.js');

exports.getByYeasTradeBimester = (id_taxpayer, id_trade, year, bimester) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM ddjj WHERE id_contribuyente = $1 AND id_comercio = $2 AND EXTRACT(YEAR FROM fecha) = $3';
        const values = [id_taxpayer, id_trade, year];       
        if (bimester) {
            const [mesInicio, mesFin] = bimester.split('-').map((mes) => {
                switch (mes) {
                    case 'Enero':
                    case 'Febrero': return 1;
                    case 'Marzo':
                    case 'Abril': return 3;
                    case 'Mayo':
                    case 'Junio': return 5;
                    case 'Julio':
                    case 'Agosto': return 7;
                    case 'Septiembre':
                    case 'Octubre': return 9;
                    case 'Noviembre':
                    case 'Diciembre': return 11;
                    default: return null;
                }
            });

            query += ' AND EXTRACT(MONTH FROM fecha) BETWEEN $4 AND $5';
            values.push(mesInicio);
            values.push((mesFin + 1));
        }
       
        
        conn.query(query, values, (err, resultados) => {          
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};