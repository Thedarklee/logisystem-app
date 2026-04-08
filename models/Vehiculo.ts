import mongoose, { Schema, models } from 'mongoose';

const vehiculoSchema = new Schema({
  patente: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  pesoTaraKg: { type: Number, required: true },
  isActivo: { type: Boolean, default: true },
  tagRFID: { type: String } // Opcional, por si el camión tiene su propio tag en el parabrisas
});

const Vehiculo = models.Vehiculo || mongoose.model('Vehiculo', vehiculoSchema);
export default Vehiculo;