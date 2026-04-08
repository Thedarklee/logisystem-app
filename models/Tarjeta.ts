import mongoose, { Schema, model, models } from 'mongoose';

// 1. Definición del Esquema
const TarjetaSchema = new Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  estado: { 
    type: String, 
    enum: ['ACTIVA', 'BLOQUEADA', 'EXTRAVIADA'], 
    default: 'ACTIVA' 
  },
  usuarioAsignado: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', // Debe coincidir con el nombre del modelo de Usuarios
    default: null 
  },
  fechaAsignacion: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Esto crea automáticamente campos 'createdAt' y 'updatedAt'
});

// 2. Exportación especial para Next.js
// Esto evita que Next.js intente recrear el modelo cada vez que el código se recarga
const Tarjeta = models.Tarjeta || model('Tarjeta', TarjetaSchema);

export default Tarjeta;