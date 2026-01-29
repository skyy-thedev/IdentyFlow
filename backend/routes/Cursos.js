const express = require("express");
const router = express.Router();
const Curso = require("../models/Cursos");
const cursoController = require("../controllers/cursoController");
const auth = require("../middlewares/authMiddleware");

// Lista apenas cursos ativos
router.get("/", auth([ "admin", "god"]), cursoController.getCursosAtivos);

router.post("/", auth(["admin", "god"]), async (req, res) => {
  try {
    const curso = new Curso(req.body);
    await curso.save();
    res.json({ msg: "Curso criado com sucesso!", curso });
  } catch (err) {
    res.status(400).json({ msg: "Erro ao criar curso", error: err.message });
  }
});

router.put("/:id", auth(["admin", "god"]), async (req, res) => {
  try {
    const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: "Curso atualizado!", curso });
  } catch {
    res.status(400).json({ msg: "Erro ao atualizar curso" });
  }
});

// Soft delete de curso
router.delete("/:id", auth(["admin", "god"]), cursoController.softDeleteCurso);

// (Opcional) Rota para reativar curso
// router.patch("/:id/reativar", auth(["admin", "god"]), cursoController.reativarCurso);

module.exports = router;
