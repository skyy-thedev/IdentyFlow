const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");

exports.cadastrarAluno = async (req, res) => {
  try {
    const { turmaId } = req.body;
    
    // Validar capacidade da turma se turmaId foi informado
    let instrutorId = req.body.instrutorId;
    if (turmaId) {
      const turma = await Turma.findById(turmaId);
      if (!turma) {
        return res.status(400).json({
          message: "Turma não encontrada",
          error: "A turma selecionada não existe"
        });
      }
      
      // Contar alunos já cadastrados nesta turma
      const alunosNaTurma = await Aluno.countDocuments({ turmaId });
      
      // Verificar se ainda há vagas
      if (alunosNaTurma >= turma.capacidade) {
        return res.status(400).json({
          message: "Turma lotada",
          error: `A turma "${turma.nome}" já atingiu a capacidade máxima de ${turma.capacidade} alunos`
        });
      }
      
      // Pegar instrutor da turma se não foi informado
      if (!instrutorId && turma.instrutorId) {
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
    console.error("Erro ao cadastrar aluno:", error);
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