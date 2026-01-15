const Aluno = require("../models/Aluno");

exports.cadastrarAluno = async (req, res) => {
  try {
    const aluno = await Aluno.create(req.body);
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({
      message: "Erro ao cadastrar aluno",
      error: error.message,
    });
  }
};

exports.turmas = async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.status(200).json({ alunos });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar turmas",
      error: error.message,
    });
  }
};