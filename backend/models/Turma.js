const mongoose = require("mongoose");

const turmaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "Nome da turma é obrigatório"],
    trim: true
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curso",
    required: [true, "Curso é obrigatório"]
  },
  dataInicio: {
    type: Date
  },
  dataFim: {
    type: Date
  },
  horario: {
    type: String,
    trim: true
  },
  capacidade: {
    type: Number,
    default: 30,
    min: 1,
    max: 100
  },
  status: {
    type: String,
    enum: ["ativa", "concluida", "cancelada"],
    default: "ativa"
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Virtual para contar alunos da turma
turmaSchema.virtual("alunosCount", {
  ref: "Aluno",
  localField: "_id",
  foreignField: "turmaId",
  count: true
});

turmaSchema.set("toJSON", { virtuals: true });
turmaSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Turma", turmaSchema);
