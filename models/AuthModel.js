"use strict";
const conn = require('../dataBase/Connection.js');

exports.register = async (nombre, apellido, cuit, email, direccion, telefono, password, razon_social, estado, id_rol) => {
    try {
        const query = `
      INSERT INTO contribuyente (nombre, apellido, cuit, email, direccion, telefono, password, razon_social, estado, id_rol)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id_contribuyente, nombre, apellido, cuit, email, direccion, telefono, razon_social, estado, id_rol
    `;
        const result = await conn.query(query, [nombre, apellido, cuit, email, direccion, telefono, password, razon_social, estado, id_rol]);
        return result.rows[0]; // Devuelve todos los datos del contribuyente
    } catch (error) {
        console.error('Error al registrar contribuyente:', error);
        throw new Error('Error al registrar contribuyente.');
    }
};

exports.addTrade = async (misComercios, id_contribuyente) => {
    try {
        const query = `
            INSERT INTO comercio (cod_comercio, nombre_comercio, direccion_comercio, estado, id_contribuyente)
            VALUES ($1, $2, $3, $4, $5)
        `;

        for (let comercios of misComercios) {
            const { codigo, nombre, direccion } = comercios;
            await conn.query(query, [codigo, nombre, direccion,false, id_contribuyente]);
        }
        return true; // Comercios agregados correctamente
    } catch (error) {
        console.error('Error al agregar los comercios:', error);
        return false;
    }
};


exports.getUserWithRole = async (usuario) => {    
    return new Promise((resolve, reject) => {
        const sql = `SELECT u.id_usuario, u.usuario, u.password, u.id_rol, r.rol
                 FROM usuario u
                 INNER JOIN rol r ON u.id_rol = r.id_rol
                 WHERE u.usuario = $1`;
        conn.query(sql, [usuario], (err, resultados) => {           
            if (err) return reject({ status: 500, message: 'Error al obtener el usuario' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve las filas si hay resultados
            resolve([]);
        });
    });
};

exports.getTaxpayerWithRole = async (cuit) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT c.id_contribuyente, c.nombre, c.apellido, c.cuit, c.password, c.id_rol, c.estado, r.rol
                 FROM contribuyente c
                 INNER JOIN rol r ON c.id_rol = r.id_rol
                 WHERE c.cuit = $1`;
        conn.query(sql, [cuit], (err, resultados) => {            
            if (err) return reject({ status: 500, message: 'Error al obtener el contribuyente' });
            if (resultados && resultados.rows.length > 0) return resolve(resultados.rows); // Devuelve las filas si hay resultados
            resolve([]);
        });
    });
};