const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Curso = require("../models/Cursos");
const User = require("../models/User");
const Turma = require("../models/Turma");
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
    const hoje = new Date();
    
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

    // ===== NOVAS MÉTRICAS =====
    
    // Alunos inscritos na semana
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const alunosSemana = await Aluno.countDocuments({
      createdAt: { $gte: seteDiasAtras }
    });
    
    // Alunos inscritos no mês
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const alunosMes = await Aluno.countDocuments({
      createdAt: { $gte: inicioMes }
    });
    
    // Total de alunos no banco de dados
    const totalAlunosDB = await Aluno.countDocuments();
    
    // Total de turmas
    const totalTurmas = await Turma.countDocuments();
    
    // Média de alunos por turma
    const alunosComTurma = await Aluno.countDocuments({ turmaId: { $exists: true, $ne: null } });
    const turmasAtivas = await Turma.countDocuments({ status: "ativa" });
    const mediaAlunosPorTurma = turmasAtivas > 0 ? (alunosComTurma / turmasAtivas).toFixed(1) : 0;
    
    // Total de alunos por turma (detalhado)
    const alunosPorTurma = await Aluno.aggregate([
      { $match: { turmaId: { $exists: true, $ne: null } } },
      { $group: { _id: "$turmaId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Buscar nomes das turmas
    const turmaIds = alunosPorTurma.map(t => t._id);
    const turmasInfo = await Turma.find({ _id: { $in: turmaIds } })
      .populate("cursoId", "nome")
      .select("_id nome horario cursoId");
    
    const turmaMap = {};
    turmasInfo.forEach(t => {
      turmaMap[t._id.toString()] = {
        nome: t.cursoId?.nome || t.nome || "Turma",
        horario: t.horario
      };
    });
    
    const alunosPorTurmaDetalhado = alunosPorTurma.map(t => ({
      turmaId: t._id,
      nome: turmaMap[t._id.toString()]?.nome || "N/A",
      horario: turmaMap[t._id.toString()]?.horario || "",
      total: t.count
    }));
    
    // Total de alunos por curso
    const alunosPorCurso = await Aluno.aggregate([
      { $unwind: "$cursos" },
      { $group: { _id: "$cursos", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // ===== MÉTRICAS FINANCEIRAS (PREMIUM) =====
    
    // Buscar todos os cursos para pegar valores
    const cursos = await Curso.find().select("nome valorTotal");
    const cursoValorMap = {};
    cursos.forEach(c => {
      cursoValorMap[c.nome] = c.valorTotal || 0;
    });
    
    // Faturamento mensal (baseado em alunos cadastrados no mês * valor do curso)
    const alunosMesAtualCompleto = await Aluno.find({
      createdAt: { $gte: inicioMes }
    }).select("cursos");
    
    let faturamentoMes = 0;
    alunosMesAtualCompleto.forEach(aluno => {
      if (aluno.cursos && aluno.cursos.length > 0) {
        aluno.cursos.forEach(curso => {
          faturamentoMes += cursoValorMap[curso] || 0;
        });
      }
    });
    
    // Faturamento anual
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const alunosAno = await Aluno.find({
      createdAt: { $gte: inicioAno }
    }).select("cursos");
    
    let faturamentoAnual = 0;
    alunosAno.forEach(aluno => {
      if (aluno.cursos && aluno.cursos.length > 0) {
        aluno.cursos.forEach(curso => {
          faturamentoAnual += cursoValorMap[curso] || 0;
        });
      }
    });
    
    // Média de faturamento mensal (baseado nos últimos 6 meses)
    const mesesPassados = hoje.getMonth() + 1;
    const mediaFaturamentoMensal = mesesPassados > 0 ? faturamentoAnual / mesesPassados : 0;
    
    // Expectativa de faturamento próximos 60 dias (baseado em turmas ativas)
    const sessentaDiasFrente = new Date();
    sessentaDiasFrente.setDate(sessentaDiasFrente.getDate() + 60);
    
    const turmasProximas = await Turma.find({
      status: "ativa",
      dataInicio: { $gte: hoje, $lte: sessentaDiasFrente }
    }).populate("cursoId", "valorTotal");
    
    let expectativaFaturamento = 0;
    for (const turma of turmasProximas) {
      const valorCurso = turma.cursoId?.valorTotal || 0;
      // Estima baseado na capacidade da turma
      expectativaFaturamento += valorCurso * (turma.capacidade || 20);
    }
    
    // Se não houver turmas futuras, estima baseado na média mensal
    if (expectativaFaturamento === 0) {
      expectativaFaturamento = mediaFaturamentoMensal * 2;
    }

    res.json({
      cadastrosPorMes,
      porEscolaridade,
      todosCursos,
      porDiaSemana,
      taxaCrescimento: parseFloat(taxaCrescimento),
      alunosMesAtual,
      alunosMesAnterior,
      // Novas métricas
      alunosSemana,
      alunosMes,
      totalAlunosDB,
      totalTurmas,
      mediaAlunosPorTurma: parseFloat(mediaAlunosPorTurma),
      alunosPorTurma: alunosPorTurmaDetalhado,
      alunosPorCurso,
      // Métricas financeiras (premium)
      faturamentoMes,
      faturamentoAnual,
      mediaFaturamentoMensal: Math.round(mediaFaturamentoMensal),
      expectativaFaturamento: Math.round(expectativaFaturamento)
    });
  } catch (err) {
    console.error("Erro ao buscar analytics:", err);
    res.status(500).json({ msg: "Erro ao buscar analytics", error: err.message });
  }
});

// Estatísticas específicas do instrutor
router.get("/instrutor/:id", auth(["admin", "god", "instrutor"]), async (req, res) => {
  try {
    const instrutorId = req.params.id;
    
    // Buscar turmas do instrutor
    const minhasTurmas = await Turma.find({ instrutorId })
      .populate("cursoId", "nome valorTotal")
      .sort({ dataInicio: -1 });
    
    // Turmas ativas
    const turmasAtivas = minhasTurmas.filter(t => t.status === "ativa").length;
    
    // IDs das turmas do instrutor
    const turmaIds = minhasTurmas.map(t => t._id);
    
    // Buscar alunos das turmas do instrutor
    const alunosDasTurmas = await Aluno.find({ turmaId: { $in: turmaIds } })
      .sort({ createdAt: -1 });
    
    // Próximos alunos (turmas ativas com data de início futura)
    const hoje = new Date();
    const turmasFuturas = minhasTurmas
      .filter(t => t.status === "ativa" && new Date(t.dataInicio) >= hoje)
      .map(t => t._id);
    
    const proximosAlunos = await Aluno.find({ turmaId: { $in: turmasFuturas } })
      .populate("turmaId", "dataInicio cursoId")
      .sort({ "turmaId.dataInicio": 1 })
      .limit(10);
    
    // Formatar próximos alunos
    const proximosAlunosFormatados = proximosAlunos.map(a => ({
      nome: a.nome,
      curso: a.cursos?.[0] || "N/A",
      dataInicio: a.turmaId?.dataInicio
    }));
    
    // Histórico de alunos (turmas concluídas)
    const turmasConcluidas = minhasTurmas
      .filter(t => t.status === "concluida")
      .map(t => t._id);
    
    const historicoAlunos = await Aluno.find({ turmaId: { $in: turmasConcluidas } })
      .populate("turmaId", "dataFim cursoId")
      .sort({ "turmaId.dataFim": -1 })
      .limit(20);
    
    const historicoFormatado = historicoAlunos.map(a => ({
      alunoNome: a.nome,
      curso: a.cursos?.[0] || "N/A",
      dataConclusao: a.turmaId?.dataFim
    }));
    
    // Calcular ganhos (baseado em valor do curso * alunos)
    // Assumindo comissão de 30% para o instrutor
    const COMISSAO_INSTRUTOR = 0.30;
    
    let ganhosTotal = 0;
    let ganhosMes = 0;
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    for (const turma of minhasTurmas) {
      if (turma.status === "concluida" || turma.status === "ativa") {
        const valorCurso = turma.cursoId?.valorTotal || 0;
        const alunosTurma = alunosDasTurmas.filter(
          a => a.turmaId?.toString() === turma._id.toString()
        ).length;
        
        const ganhoTurma = valorCurso * alunosTurma * COMISSAO_INSTRUTOR;
        ganhosTotal += ganhoTurma;
        
        // Se a turma é deste mês
        if (turma.dataInicio && new Date(turma.dataInicio) >= inicioMes) {
          ganhosMes += ganhoTurma;
        }
      }
    }
    
    // Formatar turmas
    const turmasFormatadas = minhasTurmas.slice(0, 10).map(t => ({
      cursoNome: t.cursoId?.nome || t.nome,
      dataInicio: t.dataInicio,
      horario: t.horario,
      capacidade: t.capacidade,
      alunosInscritos: alunosDasTurmas.filter(
        a => a.turmaId?.toString() === t._id.toString()
      ).length,
      status: t.status
    }));
    
    res.json({
      proximosAlunos: proximosAlunosFormatados,
      minhasTurmas: turmasFormatadas,
      historicoAlunos: historicoFormatado,
      ganhosMes,
      ganhosTotal,
      turmasAtivas,
      alunosAtendidos: alunosDasTurmas.length
    });
    
  } catch (err) {
    console.error("Erro ao buscar stats do instrutor:", err);
    res.status(500).json({ msg: "Erro ao buscar stats", error: err.message });
  }
});

// Métricas avançadas para GOD
router.get("/god-metrics", auth(["god"]), async (req, res) => {
  try {
    const Subscription = require("../models/Subscription");
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    const em30Dias = new Date();
    em30Dias.setDate(em30Dias.getDate() + 30);
    
    // Métricas de Usuários
    const totalUsuarios = await User.countDocuments();
    const usuariosByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    // Métricas de Assinaturas
    const assinaturasStarter = await Subscription.countDocuments({ 
      plano: "starter", 
      status: "ativa" 
    });
    const assinaturasPremium = await Subscription.countDocuments({ 
      plano: "premium", 
      status: "ativa" 
    });
    const assinaturasCanceladas = await Subscription.countDocuments({ 
      status: "cancelada" 
    });
    const assinaturasVencendo = await Subscription.countDocuments({
      status: "ativa",
      dataFim: { $lte: em30Dias, $gte: hoje }
    });
    
    // Receita (preços promocionais atuais)
    const assinaturasAtivas = await Subscription.find({ status: "ativa" });
    let receitaMensal = 0;
    assinaturasAtivas.forEach(sub => {
      if (sub.plano === "starter") receitaMensal += 79.90;   // Promo: de R$99,90 por R$79,90
      if (sub.plano === "premium") receitaMensal += 199.90;  // Promo: de R$299,90 por R$199,90
    });
    const receitaAnual = receitaMensal * 12;
    const ticketMedio = assinaturasAtivas.length > 0 
      ? receitaMensal / assinaturasAtivas.length 
      : 0;
    
    // Distribuição por Role
    const godCount = usuariosByRole.find(r => r._id === "god")?.count || 0;
    const adminCount = usuariosByRole.find(r => r._id === "admin")?.count || 0;
    const instrutorCount = usuariosByRole.find(r => r._id === "instrutor")?.count || 0;
    
    // Métricas do Sistema
    const totalAlunos = await Aluno.countDocuments();
    const alunosEsteMes = await Aluno.countDocuments({
      createdAt: { $gte: inicioMes }
    });
    
    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);
    mesPassado.setDate(1);
    const fimMesPassado = new Date(inicioMes);
    fimMesPassado.setDate(fimMesPassado.getDate() - 1);
    
    const alunosMesPassado = await Aluno.countDocuments({
      createdAt: { $gte: mesPassado, $lte: fimMesPassado }
    });
    
    const crescimentoPercent = alunosMesPassado > 0 
      ? ((alunosEsteMes - alunosMesPassado) / alunosMesPassado * 100).toFixed(1)
      : alunosEsteMes > 0 ? 100 : 0;
    
    res.json({
      usuarios: {
        total: totalUsuarios,
        ativosHoje: Math.floor(totalUsuarios * 0.3), // Simulado por enquanto
        picoSimultaneo: Math.floor(totalUsuarios * 0.15), // Simulado
        mediaUsoMinutos: 45 // Simulado
      },
      assinaturas: {
        starter: assinaturasStarter,
        premium: assinaturasPremium,
        cancelados: assinaturasCanceladas,
        vencemEm30Dias: assinaturasVencendo
      },
      receita: {
        mensal: receitaMensal,
        anual: receitaAnual,
        ticketMedio: ticketMedio
      },
      distribuicao: {
        god: godCount,
        admin: adminCount,
        instrutor: instrutorCount,
        godPercent: totalUsuarios > 0 ? (godCount / totalUsuarios * 100).toFixed(1) : 0,
        adminPercent: totalUsuarios > 0 ? (adminCount / totalUsuarios * 100).toFixed(1) : 0,
        instrutorPercent: totalUsuarios > 0 ? (instrutorCount / totalUsuarios * 100).toFixed(1) : 0
      },
      sistema: {
        totalAlunos,
        alunosEsteMes,
        crescimentoPercent
      }
    });
    
  } catch (err) {
    console.error("Erro ao buscar métricas GOD:", err);
    res.status(500).json({ msg: "Erro ao buscar métricas", error: err.message });
  }
});

module.exports = router;
