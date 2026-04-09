import mongoose, { Schema, models } from 'mongoose';

const usuarioSchema = new Schema({
  nombre: { type: String, required: true },
  rut: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Irá con Hash (bcrypt)
  cargo: { 
    type: String, 
    enum: ['ADMIN', 'OPERADOR', 'CONDUCTOR'],
    required: true 
  },
  isActivo: { type: Boolean, default: true },
  tarjetaId: { type: Schema.Types.ObjectId, ref: 'Tarjeta' },
  creadoEn: { type: Date, default: Date.now }
});

const Usuario = models.Usuario || mongoose.model('Usuario', usuarioSchema);
export default Usuario;