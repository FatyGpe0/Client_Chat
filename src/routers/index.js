const express = require('express');
const router = express.Router();
const net = require('net');
const model = require('../models/logins.js')();
const logins = require('../models/logins.js');
const { Console, error } = require('console');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');
const secretKey = 'tu-clave-valida';
const Message = require('../models/message.js');
//const message = require('../models/message.js');


//const readline = require('readline-sync');
const sseClients = [];

const servidor={
    port:3000,
    host: 'localhost'
};

let mensaje ='';

router.get('/index', verificarToken, async (req, res) => {
  const nombreUsuario = req.usuario.nombre;
  console.log(`Usuario logeado: ${nombreUsuario}`);
  const token = req.query.token;

  try {
    // obtiene los mensajes almacenados desde la base de datos
    const mensajes = await Message.find().sort({ fecha: 1 }); // Ordena por fecha descendente, para que salga el ultimo mensaje al final

   res.render('index', { token, nombreUsuario, mensaje, mensajes }); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener mensajes');
  }
});

router.get('/', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

function verificarToken(req, res, next){
  const token = req.query.token;

  if(!token){
    return res.status(403).json({mensaje: 'token no proporcionado'});
  }

  jwt.verify(token,secretKey,(err, decoded)=>{
    if (err)  {
      console.error(err);
      return res.status(401).json({mensaje: 'token invalido'});
    }

    req.usuario = decoded;
    next();
  });

};


//ruta para registro
router.post('/add', async(req, res)=>{
    const info = new logins(req.body);
    console.log(req.body);
    await info.save();
    res.redirect('/');
});

//ruta para inicio de sesion
router.get('/', async (req, res) => {
  try {
     // Busca un usuario con el nombre proporcionado
  const users = await logins.find();
     // Si las credenciales son válidas, puedes redirigir al usuario a la página de chat 
  res.render('index', {
    users
  });
  } catch (error) {
  console.error(error);
  res.status(500).send('Error al obtener usuario');
  }
});


router.post('/login', async (req, res) => {
    const { nombre, psw } = req.body;
    
    try {
      // Busca al usuario con el nombre
    const user = await logins.findOne({ nombre});

      // validar si encuentra al usuario
      if (!user || user.psw !== psw) {
        return res.status(401).send('Nombre o contrasena incorrectos');
      } else {  

    }

    const usuario = { id:1, nombre: `${nombre}` };
    const token = jwt.sign(usuario, secretKey, {expiresIn: '1h' });

      // Si el usuario es correcto envia a la interfaz chat
      res.redirect('/index?token=' + token);
    } catch (error) {
    console.error(error);
    res.status(500).send('Error servidor');
    }
});


const client = net.createConnection(servidor);
    client.on('connect', ()=>{
        console.log('conexion satisfactoria');
        
    })

    
    client.on('data', (data)=>{
        mensaje = data.toString('utf-8');
        console.log('mensajes del servidor:' + mensaje);

    });

router.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  sseClients.push(res);

  console.log('no se estan enviando los datos');

  req.on("close", () => {
    // Elimina la respuesta cerrada de la lista de clientes SSE
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

    

//holaa
// Ruta para enviar mensajes
router.post('/send', async (req, res) => {
  const { usuario, mensaje} = req.body;

  if (mensaje && typeof mensaje === 'string') {
    try {
      const fecha = new Date().toLocaleString(); // Convierte la fecha a una cadena string
      // Crea una instancia del mensaje y guárdalo en la base de datos
      const newMessage = new Message({ usuario, mensaje, fecha: new Date() });
      await newMessage.save();

      //console.log(mensaje)

      // Envía el nuevo mensaje a todos los clientes SSE
      sseClients.forEach((client) => {
        client.write(`data: ${JSON.stringify({usuario, mensaje, fecha })}\n\n`);
      });

      const token = req.query.token;
      res.redirect(303, '/index?token=' + token);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al guardar el mensaje');
    }
  } else {
    console.error("Error: 'mensaje' no es una cadena válida");
    res.status(400).send('Mensaje no válido');
  }
});

module.exports = router;







