const express = require("express");
const router = express.Router();
const { cadastrarAluno } = require("../controllers/alunoController");

router.post("/", cadastrarAluno);

module.exports = router;