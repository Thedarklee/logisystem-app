import mongoose, { Schema, models } from 'mongoose';

const vehiculoSchema = new Schema({
  patente: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  pesoTaraKg: { type: Number, required: true },
  isActivo: { type: Boolean, default: true },
  tagRFID: { type: String }, 
  
  // ESTE ES EL CAMPO QUE FALTA:
  conductorAsignado: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', // Debe ser el mismo nombre que usaste en mongoose.model('Usuario', ...)
    required: true 
  }
}, {
  timestamps: true // Esto te ayudará a saber cuándo se registró el vehículo
});

const Vehiculo = models.Vehiculo || mongoose.model('Vehiculo', vehiculoSchema);
export default Vehiculo;