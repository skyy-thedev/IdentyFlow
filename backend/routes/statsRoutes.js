const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Curso = require("../models/Cursos");
const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");

// Estatísticas gerais do dashboard
router.get("/dashboard", auth(["admin", "god", "instrutor"]), async (req, res) => {
  try {
    // Contagens totais
    const totalAlunos = await Aluno.countDocuments();
    const totalCursos = await Curso.countDocuments({ 
      $or: [{ ativo: true }, { ativo: { $exists: false } }] 
    });
    const totalUsuarios = await User.countDocuments();

    // Alunos cadastrados nos últimos 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const alunosRecentes = await Aluno.countDocuments({
      createdAt: { $gte: seteDiasAtras }
    });

    // Alunos cadastrados hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alunosHoje = await Aluno.countDocuments({
      createdAt: { $gte: hoje }
    });

    // Últimos 5 alunos cadastrados
    const ultimosAlunos = await Aluno.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("nome cursos createdAt");

    // Cursos mais populares (por número de alunos)
    const cursosPorAluno = await Aluno.aggregate([
      { $unwind: "$cursos" },
      { $group: { _id: "$cursos", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalAlunos,
      totalCursos,
      totalUsuarios,
      alunosRecentes,
      alunosHoje,
      ultimosAlunos,
      cursosPorAluno
    });
  } catch (err) {
    console.error("Erro ao buscar estatísticas:", err);
    res.status(500).json({ msg: "Erro ao buscar estatísticas", error: err.message });
  }
});

// Estatísticas para Analytics (mais detalhadas)
router.get("/analytics", auth(["admin", "god"]), async (req, res) => {
  try {
    // Cadastros por mês (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const cadastrosPorMes = await Aluno.aggregate([
      { $match: { createdAt: { $gte: seisMesesAtras } } },
      {
        $group: {
          _id: {
            ano: { $year: "$createdAt" },
            mes: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.ano": 1, "_id.mes": 1 } }
    ]);

    // Distribuição por escolaridade
    const porEscolaridade = await Aluno.aggregate([
      { $group: { _id: "$escolaridade", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Todos os cursos com contagem de alunos
    const todosCursos = await Aluno.aggregate([
      { $unwind: "$cursos" },
      { $group: { _id: "$cursos", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Cadastros por dia da semana
    const porDiaSemana = await Aluno.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Taxa de crescimento (comparando último mês com anterior)
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    const doisMesesAtras = new Date();
    doisMesesAtras.setMonth(doisMesesAtras.getMonth() - 2);

    const alunosMesAtual = await Aluno.countDocuments({
      createdAt: { $gte: umMesAtras }
    });
    const alunosMesAnterior = await Aluno.countDocuments({
      createdAt: { $gte: doisMesesAtras, $lt: umMesAtras }
    });

    const taxaCrescimento = alunosMesAnterior > 0 
      ? ((alunosMesAtual - alunosMesAnterior) / alunosMesAnterior * 100).toFixed(1)
      : 100;

    res.json({
      cadastrosPorMes,
      porEscolaridade,
      todosCursos,
      porDiaSemana,
      taxaCrescimento: parseFloat(taxaCrescimento),
      alunosMesAtual,
      alunosMesAnterior
    });
  } catch (err) {
    console.error("Erro ao buscar analytics:", err);
    res.status(500).json({ msg: "Erro ao buscar analytics", error: err.message });
  }
});

module.exports = router;
