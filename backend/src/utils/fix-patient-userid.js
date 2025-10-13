const mongoose = require('mongoose');
const Patient = require('../models/Patient');
require('dotenv').config();

async function fixPatientUserId() {
  try {
    // Conectar a la base de datos
    await mongoose.connect('mongodb+srv://efer:H38NARS1JRpyqogo@appproducto.ri32xgn.mongodb.net/?retryWrites=true&w=majority&appName=appProducto');
    console.log('Conectado a MongoDB');

    // IDs del problema identificado
    const patientUserId = '68ebf50ff99a445a931fcc38'; // ID del usuario paciente
    const patientRecordId = '68ebf50ff99a445a931fcc3a'; // ID del registro paciente

    // Buscar el registro paciente
    const patient = await Patient.findById(patientRecordId);
    if (!patient) {
      console.log('Paciente no encontrado');
      return;
    }

    console.log('Paciente actual:', patient);
    console.log('userId actual:', patient.userId);

    // Actualizar el userId si no coincide
    if (patient.userId !== patientUserId) {
      patient.userId = patientUserId;
      await patient.save();
      console.log('userId actualizado correctamente');
      console.log('Paciente actualizado:', patient);
    } else {
      console.log('El userId ya es correcto');
    }

    // Verificar que el paciente tenga enfermeras asignadas
    if (!patient.assignedNurses || patient.assignedNurses.length === 0) {
      console.log('El paciente no tiene enfermeras asignadas. Agregando enfermera de prueba...');
      // Agregar la enfermera que vimos en los logs
      patient.assignedNurses = ['68dd516a97a96545ecd43a63']; // ID de Maria (enfermera)
      await patient.save();
      console.log('Enfermera asignada al paciente');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar el script
fixPatientUserId();
