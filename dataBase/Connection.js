const {Pool} = require('pg');
const bcrypt = require('bcrypt');

const conn = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.MODO === 'produccion'
});

// const inizializeRolesDefault = async ()=>{
//     let rol = ['admin', 'user'];
//     try {
//         for (let r of rol) {
//             let results = await conn.query("SELECT * FROM rol WHERE rol = $1", [r]);         
//             if (results.rows.length === 0) await conn.query("INSERT INTO rol (rol) VALUES ($1)", [r]);
//             else console.log(`El rol ${r} ya existe.`);  
//         };
//     } catch (error) {
//         console.log(`Error al iniciar los roles por defecto ${error.message}`)
//     }
// }

// // Función para crear el usuario por defecto
// const initializeUserDefault = async () => {
//     const defaultUsername = "admin";
//     const defaultPassword = "admin";

//     try {
//         // Verificar si el usuario ya existe
//         const userResult = await conn.query("SELECT * FROM usuario WHERE usuario = $1", [defaultUsername]);

//         if (userResult.rows.length > 0) {
//             console.log(`Usuario por defecto ya existe: ${defaultUsername}`);
//             return;
//         }

//         // Encriptar la contraseña
//         const saltRounds = 8;
//         const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

//         // Asignar el rol de admin
//         const roleResult = await conn.query("SELECT id_rol FROM rol WHERE rol = 'admin'");
//         const roleId = roleResult.rows[0].id_rol;

//         // Crear el usuario por defecto
//         await conn.query(
//             "INSERT INTO usuario (usuario, password, id_rol) VALUES ($1, $2, $3)",
//             [defaultUsername, hashedPassword, roleId]
//         );
//         console.log(`Usuario por defecto creado: ${defaultUsername}`);
//     } catch (error) {
//         console.error("Error al inicializar el usuario por defecto:", error.message);
//     }
// };

// const initializeValues = async () => {
//     await inizializeRolesDefault();  // Inicializar roles
//     await initializeUserDefault();// Inicializar usuario por defecto
// };
// initializeValues();
module.exports = conn;