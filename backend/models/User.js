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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);