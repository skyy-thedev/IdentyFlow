const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Aluno = require("../models/Aluno");
const Curso = require("../models/Cursos");

// Obter planos disponíveis
exports.getPlanos = async (req, res) => {
  try {
    const planos = Subscription.getPlanos();
    res.json(planos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar planos", error: error.message });
  }
};

// Verificar assinatura do usuário
exports.getMinhaAssinatura = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 });
    
    // Se não tem assinatura, criar automaticamente
    // GOD recebe Premium, outros recebem Starter
    if (!subscription) {
      const planoAutomatico = userRole === "god" ? "premium" : "starter";
      const dataExpiracao = new Date();
      dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 100); // "Infinito" para plano automático
      
      subscription = new Subscription({
        userId,
        plano: planoAutomatico,
        ciclo: "mensal",
        status: "ativa",
        dataInicio: new Date(),
        dataExpiracao,
        dataProximaCobranca: dataExpiracao,
        uso: {
          alunosAnoReset: new Date()
        },
        // Marcar como plano automático/cortesia
        observacoes: userRole === "god" ? "Plano Premium automático para GOD" : "Plano Starter automático"
      });
      
      await subscription.save();
    }
    
    // Se é GOD e não tem premium, fazer upgrade automático
    if (userRole === "god" && subscription.plano !== "premium") {
      subscription.plano = "premium";
      subscription.status = "ativa";
      subscription.observacoes = "Plano Premium automático para GOD";
      await subscription.save();
    }
    
    // Verificar se expirou (exceto para GOD que é sempre ativo)
    const agora = new Date();
    if (userRole !== "god" && subscription.status === "ativa" && agora > subscription.dataExpiracao) {
      subscription.status = "expirada";
      await subscription.save();
    }
    
    // Buscar uso atual
    const alunosAno = await Aluno.countDocuments({
      createdAt: { $gte: subscription.uso.alunosAnoReset }
    });
    const cursosAtivos = await Curso.countDocuments({ 
      $or: [{ ativo: true }, { ativo: { $exists: false } }]
    });
    const instrutores = await User.countDocuments({ role: "instrutor" });
    
    const planoConfig = subscription.getPlanoConfig();
    
    res.json({
      temAssinatura: true,
      assinatura: {
        id: subscription._id,
        plano: subscription.plano,
        planoNome: planoConfig?.nome || subscription.plano,
        ciclo: subscription.ciclo,
        status: subscription.status,
        isAtiva: subscription.isAtiva() || userRole === "god",
        dataInicio: subscription.dataInicio,
        dataExpiracao: subscription.dataExpiracao,
        dataProximaCobranca: subscription.dataProximaCobranca,
        features: planoConfig?.features || {},
        limites: planoConfig?.limites || {},
        uso: {
          alunosAno,
          cursos: cursosAtivos,
          instrutores
        },
        isGod: userRole === "god",
        isAutomatic: subscription.observacoes?.includes("automático") || false
      }
    });
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    res.status(500).json({ message: "Erro ao buscar assinatura", error: error.message });
  }
};

// Verificar se usuário tem acesso a uma feature específica
exports.verificarFeature = async (req, res) => {
  try {
    const { feature } = req.params;
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ 
      userId, 
      status: { $in: ["ativa", "trial"] }
    });
    
    if (!subscription || !subscription.isAtiva()) {
      return res.json({ 
        temAcesso: false, 
        motivo: "sem_assinatura",
        message: "Assinatura necessária para acessar este recurso"
      });
    }
    
    const temFeature = subscription.temFeature(feature);
    
    res.json({
      temAcesso: temFeature,
      motivo: temFeature ? "autorizado" : "plano_insuficiente",
      planoAtual: subscription.plano,
      message: temFeature ? "Acesso autorizado" : "Recurso disponível apenas no plano Premium"
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar feature", error: error.message });
  }
};

// Verificar limite de uso
exports.verificarLimite = async (req, res) => {
  try {
    const { tipo } = req.params; // alunosAno, cursos, instrutores
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ 
      userId, 
      status: { $in: ["ativa", "trial"] }
    });
    
    if (!subscription || !subscription.isAtiva()) {
      return res.json({ 
        dentroDoLimite: false, 
        motivo: "sem_assinatura"
      });
    }
    
    // Contar uso atual
    let valorAtual = 0;
    switch (tipo) {
      case "alunosAno":
        valorAtual = await Aluno.countDocuments({
          createdAt: { $gte: subscription.uso.alunosAnoReset }
        });
        break;
      case "cursos":
        valorAtual = await Curso.countDocuments({ 
          $or: [{ ativo: true }, { ativo: { $exists: false } }]
        });
        break;
      case "instrutores":
        valorAtual = await User.countDocuments({ role: "instrutor" });
        break;
      default:
        return res.status(400).json({ message: "Tipo de limite inválido" });
    }
    
    const planoConfig = subscription.getPlanoConfig();
    const limite = planoConfig?.limites?.[tipo] || 0;
    const dentroDoLimite = valorAtual < limite;
    
    res.json({
      dentroDoLimite,
      valorAtual,
      limite,
      restante: limite - valorAtual,
      planoAtual: subscription.plano
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar limite", error: error.message });
  }
};

// Criar/Atualizar assinatura (após pagamento confirmado)
exports.criarAssinatura = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plano, ciclo, pagamento } = req.body;
    
    // Validar plano
    const planos = Subscription.getPlanos();
    if (!planos[plano]) {
      return res.status(400).json({ message: "Plano inválido" });
    }
    
    // Calcular datas
    const dataInicio = new Date();
    const dataExpiracao = new Date();
    if (ciclo === "anual") {
      dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
    } else {
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
    }
    
    // Verificar se já existe assinatura
    let subscription = await Subscription.findOne({ userId });
    
    if (subscription) {
      // Atualizar assinatura existente
      subscription.plano = plano;
      subscription.ciclo = ciclo;
      subscription.status = "ativa";
      subscription.dataInicio = dataInicio;
      subscription.dataExpiracao = dataExpiracao;
      subscription.dataProximaCobranca = dataExpiracao;
      
      if (pagamento) {
        subscription.pagamento = {
          ...subscription.pagamento,
          ...pagamento
        };
        subscription.historicoPagamentos.push({
          data: new Date(),
          valor: planos[plano][ciclo === "anual" ? "precoAnual" : "preco"],
          status: "aprovado",
          metodo: pagamento.metodo || "cartao"
        });
      }
      
      await subscription.save();
    } else {
      // Criar nova assinatura
      subscription = new Subscription({
        userId,
        plano,
        ciclo,
        status: "ativa",
        dataInicio,
        dataExpiracao,
        dataProximaCobranca: dataExpiracao,
        pagamento: pagamento || {},
        historicoPagamentos: pagamento ? [{
          data: new Date(),
          valor: planos[plano][ciclo === "anual" ? "precoAnual" : "preco"],
          status: "aprovado",
          metodo: pagamento.metodo || "cartao"
        }] : [],
        uso: {
          alunosAnoReset: new Date()
        }
      });
      
      await subscription.save();
    }
    
    res.status(201).json({
      message: "Assinatura criada com sucesso!",
      assinatura: {
        plano: subscription.plano,
        status: subscription.status,
        dataExpiracao: subscription.dataExpiracao
      }
    });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    res.status(500).json({ message: "Erro ao criar assinatura", error: error.message });
  }
};

// Iniciar trial (7 dias grátis no plano starter)
exports.iniciarTrial = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar se já usou trial
    const existente = await Subscription.findOne({ userId });
    if (existente?.trialUsado) {
      return res.status(400).json({ 
        message: "Você já utilizou o período de teste gratuito" 
      });
    }
    
    const dataInicio = new Date();
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 7); // 7 dias de trial
    
    let subscription;
    if (existente) {
      existente.plano = "starter";
      existente.status = "trial";
      existente.dataInicio = dataInicio;
      existente.dataExpiracao = dataExpiracao;
      existente.trialUsado = true;
      subscription = await existente.save();
    } else {
      subscription = await Subscription.create({
        userId,
        plano: "starter",
        status: "trial",
        dataInicio,
        dataExpiracao,
        trialUsado: true,
        uso: {
          alunosAnoReset: new Date()
        }
      });
    }
    
    res.status(201).json({
      message: "Trial de 7 dias iniciado!",
      assinatura: {
        plano: subscription.plano,
        status: subscription.status,
        dataExpiracao: subscription.dataExpiracao
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao iniciar trial", error: error.message });
  }
};

// Cancelar assinatura
exports.cancelarAssinatura = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ message: "Assinatura não encontrada" });
    }
    
    subscription.status = "cancelada";
    await subscription.save();
    
    res.json({ 
      message: "Assinatura cancelada. Você terá acesso até " + 
        subscription.dataExpiracao.toLocaleDateString("pt-BR")
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao cancelar assinatura", error: error.message });
  }
};

// Webhook para receber notificações de pagamento (gateway)
exports.webhookPagamento = async (req, res) => {
  try {
    const { evento, dados } = req.body;
    
    // TODO: Validar assinatura do webhook (segurança)
    
    switch (evento) {
      case "pagamento_aprovado":
        // Ativar/renovar assinatura
        const subscription = await Subscription.findOne({ 
          "pagamento.gatewayId": dados.clienteId 
        });
        if (subscription) {
          subscription.status = "ativa";
          const novaExpiracao = new Date();
          if (subscription.ciclo === "anual") {
            novaExpiracao.setFullYear(novaExpiracao.getFullYear() + 1);
          } else {
            novaExpiracao.setMonth(novaExpiracao.getMonth() + 1);
          }
          subscription.dataExpiracao = novaExpiracao;
          subscription.dataProximaCobranca = novaExpiracao;
          subscription.historicoPagamentos.push({
            data: new Date(),
            valor: dados.valor,
            status: "aprovado",
            transacaoId: dados.transacaoId,
            metodo: dados.metodo
          });
          await subscription.save();
        }
        break;
        
      case "pagamento_recusado":
        // Marcar como pendente
        const subRecusada = await Subscription.findOne({ 
          "pagamento.gatewayId": dados.clienteId 
        });
        if (subRecusada) {
          subRecusada.status = "pendente";
          await subRecusada.save();
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ error: error.message });
  }
};
