import { useState, useEffect } from "react";
import { useSubscription } from "../contexts/SubscriptionContext";
import { FiLock, FiZap, FiAlertTriangle } from "react-icons/fi";
import "../styles/SubscriptionGuard.css";

// Componente que bloqueia acesso se não tiver assinatura ativa
export function SubscriptionGuard({ children, showBlockedMessage = true }) {
  const { isAtiva, loading } = useSubscription();

  if (loading) {
    return (
      <div className="subscription-loading">
        <div className="spinner"></div>
        <p>Verificando assinatura...</p>
      </div>
    );
  }

  if (!isAtiva()) {
    if (!showBlockedMessage) return null;
    
    return <BlockedModal reason="sem_assinatura" />;
  }

  return children;
}

// Componente que bloqueia features específicas
export function FeatureGuard({ feature, children, fallback = null }) {
  const { temFeature, isAtiva, loading } = useSubscription();

  if (loading) return fallback;

  if (!isAtiva()) {
    return fallback || <FeatureBlocked feature={feature} reason="sem_assinatura" />;
  }

  if (!temFeature(feature)) {
    return fallback || <FeatureBlocked feature={feature} reason="plano_insuficiente" />;
  }

  return children;
}

// Alias simplificado - renderiza children ou fallback baseado na feature
export function FeatureGate({ feature, children, fallback = null }) {
  const { temFeature, isAtiva, loading } = useSubscription();

  // Durante loading, mostra fallback ou nada
  if (loading) return fallback;

  // Se não tem assinatura ativa ou não tem a feature, mostra fallback
  if (!isAtiva() || !temFeature(feature)) {
    return fallback;
  }

  return children;
}

// Componente que verifica limite
export function LimiteGuard({ tipo, children, onLimiteAtingido }) {
  const { dentroDoLimite, getUso, getLimite, isAtiva, loading } = useSubscription();

  if (loading) return children;

  if (!isAtiva()) {
    return <BlockedModal reason="sem_assinatura" />;
  }

  if (!dentroDoLimite(tipo)) {
    if (onLimiteAtingido) {
      onLimiteAtingido(getUso(tipo), getLimite(tipo));
    }
    return (
      <LimiteAtingido 
        tipo={tipo} 
        uso={getUso(tipo)} 
        limite={getLimite(tipo)} 
      />
    );
  }

  return children;
}

// Modal de bloqueio principal
export function BlockedModal({ reason = "sem_assinatura", onClose }) {
  const getMessage = () => {
    switch (reason) {
      case "sem_assinatura":
        return {
          titulo: "Acesso Bloqueado",
          mensagem: "Você precisa de uma assinatura ativa para acessar o sistema.",
          subtitulo: "Escolha um plano para continuar"
        };
      case "pagamento_pendente":
        return {
          titulo: "Pagamento Pendente",
          mensagem: "Seu pagamento não foi confirmado. Por favor, atualize seus dados de pagamento.",
          subtitulo: "Regularize sua situação para continuar"
        };
      case "assinatura_expirada":
        return {
          titulo: "Assinatura Expirada",
          mensagem: "Sua assinatura expirou. Renove para continuar usando o sistema.",
          subtitulo: "Renove agora e não perca seus dados"
        };
      default:
        return {
          titulo: "Acesso Restrito",
          mensagem: "Você não tem permissão para acessar este recurso.",
          subtitulo: ""
        };
    }
  };

  const msg = getMessage();

  return (
    <div className="blocked-modal-overlay">
      <div className="blocked-modal">
        <div className="blocked-icon">
          <FiLock size={64} />
        </div>
        <h2>{msg.titulo}</h2>
        <p className="blocked-message">{msg.mensagem}</p>
        {msg.subtitulo && <p className="blocked-subtitle">{msg.subtitulo}</p>}
        
        <div className="blocked-actions">
          <a href="/planos" className="btn-primary">
            <FiZap /> Ver Planos
          </a>
          {onClose && (
            <button className="btn-secondary" onClick={onClose}>
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de feature bloqueada (inline)
function FeatureBlocked({ feature, reason }) {
  const featureNames = {
    turmasManuais: "Turmas Manuais",
    agendaAtendimentos: "Agenda de Atendimentos",
    notificacoesWapp: "Notificações WhatsApp",
    estatisticasAvancadas: "Estatísticas Avançadas",
    downloadRelatorios: "Download de Relatórios",
    notificacaoApp: "Notificações no App",
    backup: "Backup Automático",
    suporte24h: "Suporte 24h"
  };

  return (
    <div className="feature-blocked">
      <div className="feature-blocked-icon">
        <FiLock />
      </div>
      <div className="feature-blocked-content">
        <h4>{featureNames[feature] || feature}</h4>
        <p>
          {reason === "plano_insuficiente" 
            ? "Recurso disponível apenas no plano Premium"
            : "Assinatura necessária"
          }
        </p>
        <a href="/planos" className="feature-blocked-link">
          <FiZap /> Fazer Upgrade
        </a>
      </div>
    </div>
  );
}

// Componente de limite atingido
function LimiteAtingido({ tipo, uso, limite }) {
  const tipoNames = {
    alunosAno: "alunos este ano",
    cursos: "cursos ativos",
    instrutores: "instrutores"
  };

  return (
    <div className="limite-atingido">
      <div className="limite-icon">
        <FiAlertTriangle />
      </div>
      <div className="limite-content">
        <h4>Limite Atingido</h4>
        <p>
          Você atingiu o limite de <strong>{limite} {tipoNames[tipo]}</strong> do seu plano.
        </p>
        <div className="limite-barra">
          <div className="limite-progresso" style={{ width: "100%" }}></div>
        </div>
        <span className="limite-texto">{uso} / {limite}</span>
        <a href="/planos" className="limite-link">
          <FiZap /> Fazer Upgrade para mais
        </a>
      </div>
    </div>
  );
}

// Componente de lembrete de upgrade (aparece periodicamente)
export function UpgradeReminder({ onDismiss }) {
  const { getPlano, subscription } = useSubscription();
  
  // Não mostrar se já é premium
  if (getPlano() === "premium") return null;
  
  // Não mostrar se não tem assinatura
  if (!subscription?.temAssinatura) return null;

  return (
    <div className="upgrade-reminder">
      <div className="upgrade-reminder-content">
        <FiZap className="upgrade-icon" />
        <div className="upgrade-text">
          <strong>Desbloqueie recursos Premium!</strong>
          <span>Agenda, relatórios, backup e muito mais</span>
        </div>
      </div>
      <div className="upgrade-actions">
        <a href="/planos" className="upgrade-btn">
          Ver Planos
        </a>
        {onDismiss && (
          <button className="upgrade-dismiss" onClick={onDismiss}>
            Depois
          </button>
        )}
      </div>
    </div>
  );
}

// Hook para mostrar lembrete periodicamente
export function useUpgradeReminder(intervalMinutes = 30) {
  const { isPremium, isAtiva } = useSubscription();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Não mostrar se premium ou sem assinatura
    if (isPremium() || !isAtiva()) return;

    // Verificar último dismiss
    const lastDismiss = localStorage.getItem("upgradeReminderDismiss");
    if (lastDismiss) {
      const diff = Date.now() - parseInt(lastDismiss);
      if (diff < intervalMinutes * 60 * 1000) return;
    }

    // Mostrar após 5 minutos
    const timer = setTimeout(() => {
      setShowReminder(true);
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [isPremium, isAtiva, intervalMinutes]);

  const dismiss = () => {
    setShowReminder(false);
    localStorage.setItem("upgradeReminderDismiss", Date.now().toString());
  };

  return { showReminder, dismiss };
}
