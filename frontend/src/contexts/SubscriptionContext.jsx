import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const SubscriptionContext = createContext();

// Definição dos planos (espelho do backend)
export const PLANOS = {
  starter: {
    nome: "Starter",
    preco: 79.90,
    precoAnual: 799.00,
    descricao: "Ideal para começar",
    cor: "#60a5fa",
    limites: {
      alunosAno: 1000,
      cursos: 30,
      instrutores: 10
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
    },
    beneficios: [
      "Acesso ao sistema completo",
      "Turmas geradas automaticamente",
      "Até 1.000 alunos/ano",
      "Até 30 cursos",
      "Até 10 instrutores",
      "Estatísticas diárias/mensais",
      "Notificação via e-mail",
      "Suporte em dias úteis"
    ],
    naoInclui: [
      "Agenda de atendimentos",
      "Notificações WhatsApp",
      "Download de relatórios",
      "Backup automático",
      "Suporte 24h",
      "Faturamento anual",
      "Previsão de faturamento"
    ]
  },
  premium: {
    nome: "Premium",
    preco: 149.90,
    precoAnual: 1499.00,
    descricao: "Recursos completos",
    cor: "#a78bfa",
    popular: true,
    limites: {
      alunosAno: 5000,
      cursos: 90,
      instrutores: 30
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
    },
    beneficios: [
      "Tudo do plano Starter +",
      "Turmas manuais + automáticas",
      "Até 5.000 alunos/ano",
      "Até 90 cursos",
      "Até 30 instrutores",
      "Agenda de atendimentos",
      "Notificações WhatsApp",
      "Estatísticas avançadas + anuais",
      "Faturamento anual detalhado",
      "Previsão de faturamento 60 dias",
      "Download de relatórios (PDF/Excel)",
      "Notificação no app",
      "Backup automático",
      "Suporte 24h"
    ],
    naoInclui: []
  }
};

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar assinatura do usuário
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/subscription/minha");
      setSubscription(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar assinatura:", err);
      setError(err.message);
      setSubscription({ temAssinatura: false, status: "erro" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Verificar se tem assinatura ativa
  const isAtiva = () => {
    if (!subscription?.temAssinatura) return false;
    return subscription.assinatura?.isAtiva === true;
  };

  // Verificar se tem acesso a uma feature
  const temFeature = (feature) => {
    if (!subscription?.temAssinatura || !subscription.assinatura?.isAtiva) {
      return false;
    }
    return subscription.assinatura.features?.[feature] === true;
  };

  // Verificar se está dentro do limite
  const dentroDoLimite = (tipo) => {
    if (!subscription?.temAssinatura || !subscription.assinatura?.isAtiva) {
      return false;
    }
    const uso = subscription.assinatura.uso?.[tipo] || 0;
    const limite = subscription.assinatura.limites?.[tipo] || 0;
    return uso < limite;
  };

  // Obter uso atual
  const getUso = (tipo) => {
    return subscription?.assinatura?.uso?.[tipo] || 0;
  };

  // Obter limite
  const getLimite = (tipo) => {
    return subscription?.assinatura?.limites?.[tipo] || 0;
  };

  // Obter plano atual
  const getPlano = () => {
    return subscription?.assinatura?.plano || null;
  };

  // Verificar se é premium
  const isPremium = () => {
    return getPlano() === "premium";
  };

  // Iniciar trial
  const iniciarTrial = async () => {
    try {
      await api.post("/subscription/trial");
      await fetchSubscription();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Erro ao iniciar trial" 
      };
    }
  };

  // Criar assinatura
  const criarAssinatura = async (plano, ciclo, pagamento) => {
    try {
      const res = await api.post("/subscription/criar", { plano, ciclo, pagamento });
      await fetchSubscription();
      return { success: true, data: res.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Erro ao criar assinatura" 
      };
    }
  };

  // Cancelar assinatura
  const cancelarAssinatura = async () => {
    try {
      const res = await api.post("/subscription/cancelar");
      await fetchSubscription();
      return { success: true, message: res.data.message };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Erro ao cancelar assinatura" 
      };
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      error,
      isAtiva,
      temFeature,
      dentroDoLimite,
      getUso,
      getLimite,
      getPlano,
      isPremium,
      iniciarTrial,
      criarAssinatura,
      cancelarAssinatura,
      refetch: fetchSubscription,
      PLANOS
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription deve ser usado dentro de SubscriptionProvider");
  }
  return context;
}
