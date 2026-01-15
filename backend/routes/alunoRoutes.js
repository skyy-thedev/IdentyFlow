const express = require("express");
const router = express.Router();
const { cadastrarAluno, turmas } = require("../controllers/alunoController");

router.post("/", cadastrarAluno);
router.get("/", turmas);

module.exports = router;