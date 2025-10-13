const mongoose = require('mongoose');
const Message = require('../models/Message');
require('dotenv').config();

async function clearChat() {
  try {
    // Conectar a la base de datos
    await mongoose.connect('mongodb+srv://efer:H38NARS1JRpyqogo@appproducto.ri32xgn.mongodb.net/?retryWrites=true&w=majority&appName=appProducto');
    console.log('Conectado a MongoDB');

    // Eliminar todos los mensajes
    const result = await Message.deleteMany({});
    console.log(`Eliminados ${result.deletedCount} mensajes del chat`);

    console.log('Chat limpiado exitosamente');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar el script
clearChat();
