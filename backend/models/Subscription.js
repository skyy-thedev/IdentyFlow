const mongoose = require("mongoose");

// Definição dos planos e seus limites
const PLANOS = {
  starter: {
    nome: "Starter",
    precoOriginal: 99.90,
    preco: 79.90, // Preço promocional nos primeiros 6 meses
    precoAnual: 799.00,
    mesesPromocao: 6,
    limites: {
      alunosAno: 1000,
      cursos: 30,
      instrutores: 3 // Até 3 instrutores por admin
    },
    features: {
      turmasAuto: true,
      turmasManuais: false,
      agendaAtendimentos: false,
      notificacoesWapp: false,
      estatisticasAvancadas: false,
      downloadRelatorios: false,
      notificacaoApp: false,
      backup: false,
      suporte24h: false,
      faturamentoAnual: false,
      expectativaFaturamento: false
    }
  },
  premium: {
    nome: "Premium",
    precoOriginal: 299.90,
    preco: 199.90, // Preço promocional nos primeiros 12 meses
    precoAnual: 1999.00,
    mesesPromocao: 12,
    limites: {
      alunosAno: 5000,
      cursos: 90,
      instrutores: 10 // Até 10 instrutores por admin
    },
    features: {
      turmasAuto: true,
      turmasManuais: true,
      agendaAtendimentos: true,
      notificacoesWapp: true,
      estatisticasAvancadas: true,
      downloadRelatorios: true,
      notificacaoApp: true,
      backup: true,
      suporte24h: true,
      faturamentoAnual: true,
      expectativaFaturamento: true
    }
  }
};

const SubscriptionSchema = new mongoose.Schema({
  // Relacionamento com usuário (dono da conta/empresa)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Plano atual
  plano: {
    type: String,
    enum: ["starter", "premium"],
    required: true
  },
  
  // Tipo de cobrança
  ciclo: {
    type: String,
    enum: ["mensal", "anual"],
    default: "mensal"
  },
  
  // Status da assinatura
  status: {
    type: String,
    enum: ["ativa", "pendente", "cancelada", "expirada", "trial"],
    default: "pendente"
  },
  
  // Datas importantes
  dataInicio: {
    type: Date,
    default: Date.now
  },
  dataExpiracao: {
    type: Date,
    required: true
  },
  dataProximaCobranca: {
    type: Date
  },
  
  // Informações de pagamento (para integração futura)
  pagamento: {
    metodo: {
      type: String,
      enum: ["cartao", "pix", "boleto"],
      default: "cartao"
    },
    ultimosDigitos: String, // Últimos 4 dígitos do cartão
    bandeira: String, // visa, mastercard, etc
    tokenCartao: String, // Token para cobranças recorrentes (criptografado)
    gatewayId: String // ID do cliente no gateway de pagamento
  },
  
  // Histórico de pagamentos
  historicoPagamentos: [{
    data: Date,
    valor: Number,
    status: {
      type: String,
      enum: ["aprovado", "recusado", "pendente", "estornado"]
    },
    transacaoId: String,
    metodo: String
  }],
  
  // Contadores de uso (para verificar limites)
  uso: {
    alunosAno: { type: Number, default: 0 },
    alunosAnoReset: { type: Date, default: Date.now }, // Data do reset anual
    cursos: { type: Number, default: 0 },
    instrutores: { type: Number, default: 0 }
  },
  
  // Trial
  trialUsado: {
    type: Boolean,
    default: false
  },
  
  // Observações (para marcar planos automáticos, etc)
  observacoes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Método para verificar se a assinatura está ativa
SubscriptionSchema.methods.isAtiva = function() {
  if (this.status !== "ativa" && this.status !== "trial") return false;
  if (new Date() > this.dataExpiracao) return false;
  return true;
};

// Método para verificar limite de feature
SubscriptionSchema.methods.temFeature = function(feature) {
  const planoConfig = PLANOS[this.plano];
  if (!planoConfig) return false;
  return planoConfig.features[feature] === true;
};

// Método para verificar limite numérico
SubscriptionSchema.methods.dentroDoLimite = function(tipo, valorAtual) {
  const planoConfig = PLANOS[this.plano];
  if (!planoConfig) return false;
  const limite = planoConfig.limites[tipo];
  return valorAtual < limite;
};

// Método para obter configuração do plano
SubscriptionSchema.methods.getPlanoConfig = function() {
  return PLANOS[this.plano];
};

// Static para obter todos os planos
SubscriptionSchema.statics.getPlanos = function() {
  return PLANOS;
};

module.exports = mongoose.model("Subscription", SubscriptionSchema);
module.exports.PLANOS = PLANOS;
