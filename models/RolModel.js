"use strict";
const conn = require('../dataBase/Connection.js');

exports.getRoleByName = (rol) => {
    return new Promise((resolve, reject) => {
        const sql = `select id_rol FROM rol WHERE rol = $1`;
        conn.query(sql, [rol], (err, resultados) => { 
            if (err) return reject({ status: 500, message: 'Error al obtener el rol' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
};