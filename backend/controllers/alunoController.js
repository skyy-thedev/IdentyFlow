const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");

exports.cadastrarAluno = async (req, res) => {
  try {
    const { turmaId, cursos } = req.body;
    
    // Se tem turmaId, buscar o instrutor da turma
    let instrutorId = req.body.instrutorId;
    if (turmaId && !instrutorId) {
      const turma = await Turma.findById(turmaId);
      if (turma && turma.instrutorId) {
        instrutorId = turma.instrutorId;
      }
    }
    
    const alunoData = {
      ...req.body,
      instrutorId
    };
    
    const aluno = await Aluno.create(alunoData);
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({
      message: "Erro ao cadastrar aluno",
      error: error.message,
    });
  }
};

// Buscar todos os alunos (admin/god veem todos, instrutor vê só os dele)
exports.getAlunos = async (req, res) => {
  try {
    const { role, id } = req.user;
    
    let query = {};
    
    // Se for instrutor, filtrar apenas seus alunos
    if (role === "instrutor") {
      query.instrutorId = id;
    }
    
    const alunos = await Aluno.find(query)
      .populate("turmaId", "nome dataInicio horario")
      .populate("instrutorId", "nome")
      .sort({ createdAt: -1 });
      
    res.status(200).json({ alunos });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar alunos",
      error: error.message,
    });
  }
};

// Buscar alunos de um instrutor específico
exports.getAlunosByInstrutor = async (req, res) => {
  try {
    const { instrutorId } = req.params;
    
    const alunos = await Aluno.find({ instrutorId })
      .populate("turmaId", "nome dataInicio dataFim horario status cursoId")
      .sort({ createdAt: -1 });
      
    res.status(200).json({ alunos });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar alunos do instrutor",
      error: error.message,
    });
  }
};

// Buscar alunos de uma turma específica
exports.getAlunosByTurma = async (req, res) => {
  try {
    const { turmaId } = req.params;
    
    const alunos = await Aluno.find({ turmaId })
      .populate("instrutorId", "nome")
      .sort({ nome: 1 });
      
    res.status(200).json({ alunos });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar alunos da turma",
      error: error.message,
    });
  }
};