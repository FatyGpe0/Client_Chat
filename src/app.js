const express = require('express'); // referencia a framework express
const app = express(); //se crea la aplicación de express
const log = require('morgan'); // saber los clientes conectados
const bodyParser = require('body-parser');
const path = require('path');
const IndexRoutes = require('./routers/index.js');
const {default: mongoose} = require('mongoose');
const http = require('http'); // Importa el módulo http


app.set('port', process.env.PORT || 4000 ); 
app.set('view engine', 'ejs');

//Middleware utiliza morgan
app.use(log('dev'));
app.use(bodyParser.urlencoded({extended: false}));

//Rutas
app.use('/',IndexRoutes);


// establecer el sistema de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*app.use((req, res, next)=>{
    res.locals.mensajes = '';
    next();
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});
con
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/index', (req, res) => {
    res.render('index');
});*/

app.listen(app.get('port'), () =>{
    console.log('El servidor esta funcionando en el puerto', app.get('port'));
});

mongoose.connect("mongodb+srv://faty:Sx09AnoKdsJewkAY@cluster0.q3on5sh.mongodb.net/Chat?retryWrites=true&w=majority")
.then(db=>console.log('BD conectada'))
.catch(err=>console.log(err));





