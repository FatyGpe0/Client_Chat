const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
  usuario: String, // El nombre del usuario que envió el mensaje
  mensaje: String, // El mensaje que envió
  fecha: { type: Date, default: Date.now } // La fecha y hora cuando se envió el mensaje
});

module.exports = mongoose.model('Message', Message);
