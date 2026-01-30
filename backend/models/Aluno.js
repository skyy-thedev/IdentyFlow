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
    // Vínculo com turma e instrutor
    turmaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turma"
    },
    instrutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // Status de pagamento
    statusPagamento: {
      type: String,
      enum: ["pendente", "pago", "parcial", "isento"],
      default: "pendente"
    },
    formaPagamento: {
      type: String,
      enum: ["", "pix", "credito", "debito", "dinheiro", "boleto"],
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aluno", AlunoSchema);