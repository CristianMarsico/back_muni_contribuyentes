const jwt = require('jsonwebtoken');

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
