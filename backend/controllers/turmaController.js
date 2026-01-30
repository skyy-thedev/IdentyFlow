const Turma = require("../models/Turma");
const Aluno = require("../models/Aluno");

// Listar todas as turmas
exports.getTurmas = async (req, res) => {
  try {
    const turmas = await Turma.find()
      .populate("cursoId", "titulo")
      .sort({ createdAt: -1 });

    // Contar alunos por turma
    const turmasComCount = await Promise.all(
      turmas.map(async (turma) => {
        const alunosCount = await Aluno.countDocuments({ turmaId: turma._id });
        return {
          ...turma.toObject(),
          alunosCount
        };
      })
    );

    res.json(turmasComCount);
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    res.status(500).json({ message: "Erro ao buscar turmas", error: error.message });
  }
};

// Buscar turma por ID
exports.getTurmaById = async (req, res) => {
  try {
    const turma = await Turma.findById(req.params.id)
      .populate("cursoId", "titulo");

    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    const alunosCount = await Aluno.countDocuments({ turmaId: turma._id });

    res.json({
      ...turma.toObject(),
      alunosCount
    });
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    res.status(500).json({ message: "Erro ao buscar turma", error: error.message });
  }
};

// Criar nova turma
exports.createTurma = async (req, res) => {
  try {
    const { nome, cursoId, dataInicio, dataFim, horario, capacidade, status } = req.body;

    const turma = new Turma({
      nome,
      cursoId,
      dataInicio,
      dataFim,
      horario,
      capacidade,
      status,
      criadoPor: req.user?.id
    });

    await turma.save();

    const turmaPopulada = await Turma.findById(turma._id)
      .populate("cursoId", "titulo");

    res.status(201).json(turmaPopulada);
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    res.status(500).json({ message: "Erro ao criar turma", error: error.message });
  }
};

// Atualizar turma
exports.updateTurma = async (req, res) => {
  try {
    const { nome, cursoId, dataInicio, dataFim, horario, capacidade, status } = req.body;

    const turma = await Turma.findByIdAndUpdate(
      req.params.id,
      { nome, cursoId, dataInicio, dataFim, horario, capacidade, status },
      { new: true, runValidators: true }
    ).populate("cursoId", "titulo");

    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    res.json(turma);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    res.status(500).json({ message: "Erro ao atualizar turma", error: error.message });
  }
};

// Excluir turma
exports.deleteTurma = async (req, res) => {
  try {
    const turma = await Turma.findByIdAndDelete(req.params.id);

    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    res.json({ message: "Turma excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    res.status(500).json({ message: "Erro ao excluir turma", error: error.message });
  }
};

// Listar turmas por curso
exports.getTurmasByCurso = async (req, res) => {
  try {
    const turmas = await Turma.find({ cursoId: req.params.cursoId })
      .populate("cursoId", "titulo")
      .sort({ createdAt: -1 });

    res.json(turmas);
  } catch (error) {
    console.error("Erro ao buscar turmas do curso:", error);
    res.status(500).json({ message: "Erro ao buscar turmas", error: error.message });
  }
};

// Listar alunos da turma
exports.getAlunosDaTurma = async (req, res) => {
  try {
    const alunos = await Aluno.find({ turmaId: req.params.id })
      .sort({ nome: 1 });

    res.json(alunos);
  } catch (error) {
    console.error("Erro ao buscar alunos da turma:", error);
    res.status(500).json({ message: "Erro ao buscar alunos", error: error.message });
  }
};

// Buscar próxima turma disponível para um curso
exports.getProximaTurma = async (req, res) => {
  try {
    const { cursoNome } = req.params;
    const Curso = require("../models/Cursos");
    
    // Buscar o curso pelo nome
    const curso = await Curso.findOne({ 
      nome: cursoNome,
      $or: [{ ativo: true }, { ativo: { $exists: false } }]
    });

    if (!curso) {
      return res.status(404).json({ 
        message: "Curso não encontrado",
        proximaTurma: null 
      });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Buscar próxima turma ativa com vagas disponíveis
    const turma = await Turma.findOne({
      cursoId: curso._id,
      status: "ativa",
      dataInicio: { $gte: hoje }
    })
    .populate("cursoId", "nome valorTotal cargaHoraria dias")
    .sort({ dataInicio: 1 });

    if (turma) {
      // Contar alunos matriculados
      const alunosMatriculados = await Aluno.countDocuments({ turmaId: turma._id });
      const vagasDisponiveis = turma.capacidade - alunosMatriculados;

      return res.json({
        proximaTurma: {
          _id: turma._id,
          nome: turma.nome,
          dataInicio: turma.dataInicio,
          dataFim: turma.dataFim,
          horario: turma.horario,
          capacidade: turma.capacidade,
          alunosMatriculados,
          vagasDisponiveis,
          curso: {
            nome: curso.nome,
            valorTotal: curso.valorTotal,
            cargaHoraria: curso.cargaHoraria,
            dias: curso.dias
          }
        }
      });
    }

    // Se não há turma cadastrada, calcular próxima data baseada nos dias do curso
    const diasParaProximaTurma = curso.dias || 30;
    const proximaData = new Date();
    proximaData.setDate(proximaData.getDate() + diasParaProximaTurma);

    res.json({
      proximaTurma: null,
      sugestao: {
        proximaDataDisponivel: proximaData,
        mensagem: `Próxima turma prevista para ${proximaData.toLocaleDateString('pt-BR')}`,
        curso: {
          nome: curso.nome,
          valorTotal: curso.valorTotal,
          cargaHoraria: curso.cargaHoraria,
          dias: curso.dias
        }
      }
    });
  } catch (error) {
    console.error("Erro ao buscar próxima turma:", error);
    res.status(500).json({ message: "Erro ao buscar próxima turma", error: error.message });
  }
};
