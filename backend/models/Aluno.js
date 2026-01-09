const mongoose = require("mongoose");

const AlunoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    dataNascimento: String,
    cpf: { type: String, required: true },
    rg: String,
    telefone: String,
    email: String,
    dataCadastro: String,
    endereco: String,
    escolaridade: String,
    cursos: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aluno", AlunoSchema);