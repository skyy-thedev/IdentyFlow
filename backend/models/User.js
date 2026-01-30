const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
  telefone: { type: String },
  foto: { type: String }, // Base64 ou URL
  role: { 
    type: String, 
    enum: ["god", "admin", "instrutor"], 
    default: "instrutor" 
  },
  // Admin pai - referência para instrutores vinculados a um admin
  adminPai: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null // null para god e admins, preenchido para instrutores
  },
  // Nome da empresa/academia (apenas para admins)
  nomeEmpresa: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Índice para buscar instrutores por admin
userSchema.index({ adminPai: 1 });

module.exports = mongoose.model("User", userSchema);