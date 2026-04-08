import mongoose, { Schema, models } from 'mongoose';

const tarjetaSchema = new Schema({
  codigoRFID: { type: String, required: true, unique: true },
  estado: { 
    type: String, 
    enum: ['DISPONIBLE', 'ASIGNADA', 'EXTRAVIADA'], 
    default: 'DISPONIBLE' 
  },
  tipo: { type: String, default: 'CONDUCTOR' },
  ultimoUso: { type: Date }
});

const Tarjeta = models.Tarjeta || mongoose.model('Tarjeta', tarjetaSchema);
export default Tarjeta;