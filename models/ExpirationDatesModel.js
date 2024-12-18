"use strict";
const conn = require('../dataBase/Connection.js');

exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_vencimiento, extract(DAY from (fecha_vencimiento)) as dia, extract(MONTH from (fecha_vencimiento)) as mes, extract(YEAR from (fecha_vencimiento)) as anio FROM fecha_vencimiento ORDER BY id_vencimiento';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener las fechas' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve solo las filas
            resolve([]);  // Devuelve una lista vacía si no hay tareas
        });
    });
};

exports.updateExipirationDate = async (id, date) => {
    const query = `
        UPDATE fecha_vencimiento
        SET fecha_vencimiento = $1
        WHERE id_vencimiento = $2
        RETURNING id_vencimiento, fecha_vencimiento;
    `;
    const values = [date, id];

    const result = await conn.query(query, values);
    return result.rows[0];
};
