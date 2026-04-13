import mongoose, { Schema, models } from 'mongoose';

const lecturaAccesoSchema = new Schema({
  fechaHora: { type: Date, default: Date.now },
  tipoMovimiento: { 
    type: String, 
    enum: ['ENTRADA', 'SALIDA'], 
    required: true 
  },
  metodo: { 
    type: String, 
    enum: ['AUTOMATICO', 'MANUAL'], 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['EXITOSO', 'FALLIDO', 'ALERTA'], // Agregué ALERTA por si acaso
    required: true 
  },
  
  // Datos desnormalizados para que las consultas del Dashboard sean ultrarrápidas
  conductor: {
    usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: { type: String },
    rut: { type: String } // <--- ✨ ¡ESTE ES EL ESLABÓN PERDIDO! ✨
  },
  vehiculo: {
    vehiculoId: { type: Schema.Types.ObjectId, ref: 'Vehiculo' },
    patente: { type: String }
  },
  
  dispositivoId: { type: String },
  observaciones: { type: String } 
});

const LecturaAcceso = models.LecturaAcceso || mongoose.model('LecturaAcceso', lecturaAccesoSchema);
export default LecturaAcceso;