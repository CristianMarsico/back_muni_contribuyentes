const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const conn = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.MODO === 'produccion'
});
// Función para crear roles por defecto
const inizializeRolesDefault = async () => {
    let rol = ['admin', 'user'];
    try {
        for (let r of rol) {
            let results = await conn.query("SELECT * FROM rol WHERE rol = $1", [r]);
            if (results.rows.length === 0) await conn.query("INSERT INTO rol (rol) VALUES ($1)", [r]);
            else console.log(`El rol ${r} ya existe.`);
        };
    } catch (error) {
        console.log(`Error al iniciar los roles por defecto ${error.message}`)
    }
}

// Función para crear el usuario por defecto
const initializeUserDefault = async () => {
    const defaultUsername = "admin";
    const defaultPassword = "admin";

    try {
        // Verificar si el usuario ya existe
        const userResult = await conn.query("SELECT * FROM usuario WHERE usuario = $1", [defaultUsername]);

        if (userResult.rows.length > 0) {
            console.log(`Usuario por defecto ya existe: ${defaultUsername}`);
            return;
        }

        // Encriptar la contraseña
        const saltRounds = 8;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        // Asignar el rol de admin
        const roleResult = await conn.query("SELECT id_rol FROM rol WHERE rol = 'admin'");
        const roleId = roleResult.rows[0].id_rol;

        // Crear el usuario por defecto
        await conn.query(
            "INSERT INTO usuario (usuario, password, id_rol) VALUES ($1, $2, $3)",
            [defaultUsername, hashedPassword, roleId]
        );
        console.log(`Usuario por defecto creado: ${defaultUsername}`);
    } catch (error) {
        console.error("Error al inicializar el usuario por defecto:", error.message);
    }
};

//  Función iniciar fechas por defecto
const initializeFechasDefault = async () => {
    try {
        // Verificar si el usuario ya existe
        const exists = await conn.query("select 1 from fecha_vencimiento");

        if (exists.rowCount > 0) {
            console.log(`Las fechas ya fueron cargadas por defecto`);
            return;
        }
        // Crear fechas por defecto
        const sql = `insert into fecha_vencimiento (id_vencimiento, nro_cuota, fecha_vencimiento)
                                                    values
                                                        (1, 1, to_date('2025-02-28', 'yyyy-mm-dd')),
                                                        (2, 2, to_date('2025-03-31', 'yyyy-mm-dd')),
                                                        (3, 3, to_date('2025-04-30', 'yyyy-mm-dd')),
                                                        (4, 4, to_date('2025-05-30', 'yyyy-mm-dd')),
                                                        (5, 5, to_date('2025-06-30', 'yyyy-mm-dd')),
                                                        (6, 6, to_date('2025-07-31', 'yyyy-mm-dd')),
                                                        (7, 7, to_date('2025-08-30', 'yyyy-mm-dd')),
                                                        (8, 8, to_date('2025-09-30', 'yyyy-mm-dd')),
                                                        (9, 9, to_date('2025-10-31', 'yyyy-mm-dd')),
                                                        (10, 10, to_date('2025-11-28', 'yyyy-mm-dd')),
                                                        (11, 11, to_date('2025-12-30', 'yyyy-mm-dd')),
                                                        (12, 12, to_date('2026-01-30', 'yyyy-mm-dd'))`;
        await conn.query(sql);
        console.log(`Fechas por defecto creadas`);
    } catch (error) {
        console.error("Error al inicializar las fechas por defecto:", error.message);
    }
};

//  Función iniciar configuraciones por defecto
const initializeDataConfigDefault = async () => {
    try {
        // Verificar si el usuario ya existe
        const exists = await conn.query("select 1 from configuracion");

        if (exists.rowCount > 0) {
            console.log(`Las configuraciones ya fueron cargadas`);
            return;
        }
        // Crear fechas por defecto
        const sql = `insert into configuracion (id_configuracion, fecha_limite_ddjj, tasa_actual, monto_defecto, tasa_default)
                                                    values (1, 26, 0.08, 9999, 0.10) `;
        await conn.query(sql);
        console.log(`Configuraciones generales cargadas`);
    } catch (error) {
        console.error("Error al inicializar las configuraciones generales:", error.message);
    }
};

const initializeValues = async () => {
    await inizializeRolesDefault();  // Inicializar roles
    await initializeUserDefault();// Inicializar usuario por defecto
    await initializeFechasDefault();// Inicializar fechas por defecto
    await initializeDataConfigDefault();
};
initializeValues();
module.exports = conn;