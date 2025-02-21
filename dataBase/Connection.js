const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');

/**
 * Conexión a la base de datos utilizando la librería `pg`.
 * 
 * Esta conexión usa las variables de entorno definidas en `process.env` para configurar la conexión
 * con la base de datos de PostgreSQL, incluyendo la configuración de SSL para producción.
 * 
 * @const {Pool} conn - Objeto de conexión a la base de datos PostgreSQL.
 */
const conn = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.MODO === 'produccion'
});

/**
 * Función para inicializar los roles por defecto en la base de datos.
 * Si los roles no existen, los inserta.
 * 
 * @function initializeRolesDefault
 * 
 * @returns {void} - No devuelve nada, solo realiza la inicialización de los roles.
 */
const inizializeRolesDefault = async () => {
    let rol = ['super_admin', 'admin', 'user'];
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

/**
 * Función para inicializar un usuario por defecto en la base de datos.
 * Si el usuario con rol supér admin ya existe, no realiza ninguna acción.
 * 
 * @function initializeUserDefault
 * 
 * @returns {void} - No devuelve nada, solo crea el usuario si no existe.
 */
const initializeUserDefault = async () => {
    const defaultUsername = "admin";
    const defaultPassword = "admin";

    try {
        // Obtener el id del rol 'super_admin' (asumiendo que ya existe)
        const roleResult = await conn.query("SELECT id_rol FROM rol WHERE rol = 'super_admin'");
        const roleId = roleResult.rows[0]?.id_rol;

        if (!roleId) {
            console.error("Error: No se encontró el rol 'super_admin'. Verifica que se haya creado correctamente.");
            return;
        }

        // Verificar si ya existe un usuario con el rol 'super_admin'
        const userResult = await conn.query("SELECT * FROM usuario WHERE id_rol = $1", [roleId]);

        if (userResult.rows.length > 0) {
            console.log("Ya existe un usuario con el rol 'super_admin', no se creará uno nuevo.");
            return;
        }

        // Encriptar la contraseña
        const saltRounds = 8;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

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

/**
 * Función para inicializar las fechas de vencimiento por defecto en la base de datos.
 * Si las fechas ya existen, no realiza ninguna acción.
 * 
 * @function initializeFechasDefault
 * 
 * @returns {void} - No devuelve nada, solo carga las fechas si no existen.
 */
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

/**
 * Función para inicializar las configuraciones generales por defecto en la base de datos.
 * Si las configuraciones ya existen, no realiza ninguna acción.
 * 
 * @function initializeDataConfigDefault
 * 
 * @returns {void} - No devuelve nada, solo carga las configuraciones si no existen.
 */
const initializeDataConfigDefault = async () => {
    try {
        // Verificar si el usuario ya existe
        const exists = await conn.query("select 1 from configuracion");

        if (exists.rowCount > 0) {
            console.log(`Las configuraciones ya fueron cargadas`);
            return;
        }
        // Crear fechas por defecto
        const sql = `insert into configuracion (id_configuracion, fecha_limite_ddjj, tasa_actual, monto_defecto, whatsapp, email, telefono, direccion, facebook, instagram)
                                                    values (1, 27, 0.08, 9999, 2262545454, 'info@municipio.gob.ar', 2261445454, 'Italia 67', 'www.facebook.com/municipalidadloberia', 'www.instagram.com/muniloberia') `;
        await conn.query(sql);
        console.log(`Configuraciones generales cargadas`);
    } catch (error) {
        console.error("Error al inicializar las configuraciones generales:", error.message);
    }
};

/**
 * Inserta las DDJJ faltantes para los contribuyentes y comercios que no tienen registros asociados.
 * 
 * Esta función consulta la configuración para obtener el `monto_defecto`, verifica los comercios activos 
 * que no tienen una DDJJ registrada, y los inserta en la base de datos con un estado inicial.
 * 
 * @async
 * @returns {Promise<boolean>} - Devuelve `true` si no hay DDJJ faltantes, de lo contrario `false`.
 * @throws {Error} - Si ocurre un error al consultar o insertar datos en la base de datos.
 * 
 * @example
 * insertarDDJJFaltantes()
 *   .then((resultado) => console.log(resultado ? "Sin DDJJ faltantes" : "DDJJ pendientes insertadas"))
 *   .catch((error) => console.error(error.message));
 */
const insertarDDJJFaltantes = async () => {
    try {
        const { rows: config } = await conn.query("SELECT monto_defecto FROM configuracion LIMIT 1");
        if (!config.length) throw new Error("No se encontró el monto_defecto en la configuración.");

        const { rows } = await conn.query(`
            SELECT c.id_contribuyente, com.id_comercio
            FROM contribuyente c
            JOIN comercio com 
                ON c.id_contribuyente = com.id_contribuyente
            LEFT JOIN ddjj d 
                ON com.id_comercio = d.id_comercio 
                AND c.id_contribuyente = d.id_contribuyente
            WHERE d.id_comercio IS NULL
                AND com.estado = true              
            LIMIT 100;
        `);

        if (rows.length === 0) {
            console.log("no hay ddjj para rectificar")
            return true;
        }

        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        const today = new Date();
        const nombreMes = meses[(1 - 1 + 12) % 12];

        for (const { id_contribuyente, id_comercio } of rows) {
            await conn.query(`
                INSERT INTO ddjj (id_contribuyente, id_comercio, fecha, monto, descripcion, cargada_en_tiempo, tasa_calculada, cargada_rafam, rectificada)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [id_contribuyente, id_comercio, today, config[0].monto_defecto, `Necesita Rectificar el mes de ${nombreMes}`, false, config[0].monto_defecto, false, false]);
        }

        return false;
    } catch (error) {
        console.error("Error insertando DDJJ:", error.message);
        return false;
    }
};

/**
 * Ejecuta el proceso recursivo para insertar DDJJ faltantes hasta que no haya pendientes.
 * 
 * Esta función llama a `insertarDDJJFaltantes` de forma recursiva con un intervalo de 1 minuto 
 * entre cada ejecución hasta que todas las DDJJ hayan sido insertadas.
 * 
 * @async
 * @returns {Promise<void>} - No devuelve un valor, pero registra mensajes en consola sobre el estado del proceso.
 * 
 * @example
 * ejecutarDDJJRecursivo();
 */
const ejecutarDDJJRecursivo = async () => {
    try {
        let hayPendientes;
        do {
            hayPendientes = await insertarDDJJFaltantes();
            if (!hayPendientes) await new Promise(res => setTimeout(res, 60000)); // Espera 1 minuto
        } while (!hayPendientes);
        console.log("Todas las DDJJ insertadas.");
    } catch (error) {
        console.error("Error en ejecución recursiva:", error.message);
    }
};

/**
 * Programa una tarea recurrente para insertar DDJJ faltantes en una fecha específica cada mes.
 * 
 * La función consulta la fecha límite configurada y utiliza un programador de tareas 
 * para ejecutar el proceso en esa fecha de cada mes.
 * 
 * @async
 * @returns {Promise<void>} - No devuelve un valor, pero registra mensajes en consola sobre el estado de la programación.
 * @throws {Error} - Si no se encuentra la fecha límite en la configuración.
 * 
 * @example
 * programarTareaDDJJ()
 *   .then(() => console.log("Tarea programada con éxito"))
 *   .catch((error) => console.error(error.message));
 */
const programarTareaDDJJ = async () => {
    try {
        const { rows } = await conn.query("SELECT fecha_limite_ddjj FROM configuracion LIMIT 1");
        if (!rows.length) throw new Error("No se encontró la fecha límite.");

        const fechaLimite = rows[0].fecha_limite_ddjj;
        schedule.scheduleJob(`0 0 ${fechaLimite} * *`, ejecutarDDJJRecursivo);
        console.log(`Tarea programada para el día ${fechaLimite} de cada mes.`);
    } catch (error) {
        console.error("Error programando la tarea:", error.message);
    }
};

/**
 * Verifica si la fecha límite de DDJJ ya pasó y ejecuta el proceso si es necesario.
 * 
 * Consulta la fecha límite configurada y, si el día actual es posterior o igual a esa fecha, 
 * ejecuta el proceso para insertar DDJJ faltantes.
 * 
 * @async
 * @returns {Promise<void>} - No devuelve un valor, pero registra mensajes en consola sobre el estado de la verificación y ejecución.
 * @throws {Error} - Si no se encuentra la fecha límite en la configuración.
 * 
 * @example
 * verificarYEjecutarDDJJ()
 *   .then(() => console.log("Verificación y ejecución completada"))
 *   .catch((error) => console.error(error.message));
 */
const verificarYEjecutarDDJJ = async () => {
    try {
        const { rows } = await conn.query("SELECT fecha_limite_ddjj FROM configuracion LIMIT 1");
        if (!rows.length) throw new Error("No se encontró la fecha límite.");

        const fechaLimite = rows[0].fecha_limite_ddjj;
        const today = new Date().getDate();

        if (today >= fechaLimite) {
            console.log("La fecha límite ya pasó este mes. Ejecutando DDJJ ahora...");
            await ejecutarDDJJRecursivo();
        }
    } catch (error) {
        console.error("Error al verificar ejecución:", error.message);
    }
};

/**
 * Inicializa todos los valores y verifica si se deben ejecutar las DDJJ.
 */
const initializeValues = async () => {
    await inizializeRolesDefault();
    await initializeUserDefault();
    await initializeFechasDefault();
    await initializeDataConfigDefault();

    await verificarYEjecutarDDJJ(); // Solo ejecuta DDJJ si ya pasó la fecha límite
    await programarTareaDDJJ(); // Programa la ejecución futura
};

initializeValues();
module.exports = { conn, verificarYEjecutarDDJJ };