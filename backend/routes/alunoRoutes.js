const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController");
const auth = require("../middlewares/authMiddleware");

// Rotas protegidas
router.post("/", auth([]), alunoController.cadastrarAluno);
router.get("/", auth([]), alunoController.getAlunos);

// Rota para buscar alunos de um instrutor específico
router.get("/instrutor/:instrutorId", auth([]), alunoController.getAlunosByInstrutor);

// Rota para buscar alunos de uma turma específica
router.get("/turma/:turmaId", auth([]), alunoController.getAlunosByTurma);

module.exports = router;