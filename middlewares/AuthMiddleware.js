const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica si el usuario está autenticado mediante un token JWT en las cookies.
 * 
 * Este middleware intercepta las solicitudes y valida el token JWT para garantizar que el usuario tenga acceso a los recursos protegidos.
 * Si el token es válido, almacena la información decodificada del usuario en el objeto `req.user`.
 * Si el token es inválido o no se encuentra, devuelve una respuesta con un error.
 * 
 * @function AuthMiddleware
 * @param {Object} req - La solicitud HTTP que contiene las cookies con el token JWT.
 * @param {Object} res - La respuesta HTTP que devuelve un error si el token es inválido o no está presente.
 * @param {function} next - Función que permite pasar al siguiente middleware si el token es válido.
 * @returns {Object} Respuesta JSON con un mensaje de error si el token es inválido o no se encuentra.
 */
exports.AuthMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;   
    if (!token) return res.status(401).json({ error: "No autorizado. Por favor, inicia sesión." });
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Almacenar los datos decodificados del usuario en la solicitud
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token inválido o expirado." });
    }
};
