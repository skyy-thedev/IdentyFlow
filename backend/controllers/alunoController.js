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
