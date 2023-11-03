const jwt = require('jsonwebtoken');
const router = require('../routers');

function verificarToken(req, res, next){ //agregamos la función para crear la verificación del token
  const token = req.header('Authorization');

  if(!token){
    return res.status(401).json({mensaje: 'Acceso denegado. Token no proporcionado.'})
  }

  try{
    const usuarioVerificado = jwt.verify(token, secretKey);
    req.nombre = usuarioVerificado;
    next();
  }catch(error){
    res.status(401).json({mensaje: 'token no valido'});
  }
}

module.exports = router;