"use strict";
const conn = require('../dataBase/Connection.js');

exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contribuyente WHERE estado = false';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los contribuyentes' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

exports.editActive = async (id) => {
    const query = `
        UPDATE CONTRIBUYENTE
        SET estado = true
        WHERE id_contribuyente = $1
        RETURNING id_contribuyente;
    `;
    const values = [id];

    const result = await conn.query(query, values);
    return result.rows[0];
};