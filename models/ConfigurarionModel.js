"use strict";
const conn = require('../dataBase/Connection.js');

exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM configuracion';
        conn.query(sql, (err, resultados) => {
            if (err) return reject({ status: 500, message: 'Error al obtener los datos de configuracion' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows);
            resolve([]);
        });
    });
};

exports.updateConfiguration = async (id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, tasa_default) => {
    const query = `
        UPDATE configuracion
        SET 
            fecha_limite_ddjj = $1,
            tasa_actual = $2,
            monto_defecto = $3,
            tasa_default = $4
        WHERE id_configuracion = $5;
    `;
    const values = [fecha_limite_ddjj, tasa_actual,monto_ddjj_defecto, tasa_default, id];
    try {
        await conn.query(query, values);
        return { success: true };
    } catch (err) {       
        throw new Error('Error en la base de datos');
    }
};
