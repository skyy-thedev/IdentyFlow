const express = require("express");
const router = express.Router();
const turmaController = require("../controllers/turmaController");
const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas requerem autenticação
// Rotas de turmas
router.get("/", authMiddleware([]), turmaController.getTurmas);
router.get("/proxima/:cursoNome", authMiddleware([]), turmaController.getProximaTurma);
router.get("/:id", authMiddleware([]), turmaController.getTurmaById);
router.post("/", authMiddleware(["god", "admin", "instrutor"]), turmaController.createTurma);
router.put("/:id", authMiddleware(["god", "admin", "instrutor"]), turmaController.updateTurma);
router.delete("/:id", authMiddleware(["god", "admin"]), turmaController.deleteTurma);

// Rotas especiais
router.get("/curso/:cursoId", authMiddleware([]), turmaController.getTurmasByCurso);
router.get("/:id/alunos", authMiddleware([]), turmaController.getAlunosDaTurma);

module.exports = router;
