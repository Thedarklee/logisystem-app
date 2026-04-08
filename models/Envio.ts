import mongoose, { Schema, models } from 'mongoose';

const envioSchema = new Schema({
  numeroEnvio: { type: String, required: true, unique: true },
  estado: { 
    type: String, 
    enum: ['ABIERTO', 'PROGRAMADO', 'EN_RUTA', 'FINALIZADO'], 
    default: 'ABIERTO' 
  },
  isActivo: { type: Boolean, default: true },
  
  logistica: {
    origen: { type: String, required: true },
    destino: { type: String, required: true },
    fechaSalidaEstimada: { type: Date },
    fechaLlegadaEstimada: { type: Date },
    fechaCierreReal: { type: Date, default: null } // Se llena al cerrar el envío (HU07)
  },
  
  carga: {
    tipo: { type: String, required: true },
    descripcion: { type: String },
    pesoKg: { type: Number, required: true }
  },
  
  recursos: {
    conductorId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    vehiculoId: { type: Schema.Types.ObjectId, ref: 'Vehiculo' },
    patente: { type: String } // Copia para búsqueda rápida en el frontend
  },
  
  fechaCreacion: { type: Date, default: Date.now }
});

const Envio = models.Envio || mongoose.model('Envio', envioSchema);
export default Envio;