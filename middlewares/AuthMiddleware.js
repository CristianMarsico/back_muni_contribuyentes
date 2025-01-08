const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar que el usuario esté autenticado mediante un token JWT.
 *
 * Esta función busca el token JWT en las cookies de la solicitud, lo verifica y
 * almacena la información decodificada del usuario en la solicitud para su uso posterior.
 * Si el token no es válido o no está presente, se devuelve un error.
 *
 * @function AuthMiddleware
 *
 * @param {Object} req - El objeto de la solicitud.
 * @param {Object} res - El objeto de la respuesta.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 *
 * @returns {Object} Respuesta con el estado de autorización o un error.
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
