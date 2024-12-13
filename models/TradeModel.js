"use strict";
const conn = require('../dataBase/Connection.js');

exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM comercio';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

exports.get = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_comercio, cod_comercio, nombre_comercio, estado FROM comercio WHERE id_contribuyente = $1';
        conn.query(sql, [id], (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los comercios del contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

exports.activeState = async (id) => {
    const query = `
        UPDATE comercio
        SET estado = true
        WHERE id_comercio = $1
        RETURNING id_comercio;
    `;
    const values = [id];

    const result = await conn.query(query, values);
    return result.rows[0];
};