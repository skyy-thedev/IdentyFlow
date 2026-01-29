const mongoose = require("mongoose");


// Modelo de Curso com soft delete
const CursoSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  cargaHoraria: { type: Number, required: true },
  dias: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
  minVagas: { type: Number, required: true },
  maxVagas: { type: Number, required: true },
  criadoEm: { type: Date, default: Date.now },
  // Soft delete fields
  ativo: { type: Boolean, default: true }, // Indica se o curso está ativo
  deletadoEm: { type: Date, default: null } // Data de exclusão lógica
});

module.exports = mongoose.model("Curso", CursoSchema);
