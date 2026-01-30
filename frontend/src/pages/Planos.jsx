import { useState } from "react";
import { 
  FiCheck, 
  FiX, 
  FiZap, 
  FiShield, 
  FiCreditCard,
  FiCalendar,
  FiArrowLeft
} from "react-icons/fi";
import { useSubscription, PLANOS } from "../contexts/SubscriptionContext";
import { useLocation } from "wouter";
import "../styles/Planos.css";

export default function Planos({ showToast }) {
  const [, setLocation] = useLocation();
  const { subscription, criarAssinatura, iniciarTrial, loading } = useSubscription();
  const [ciclo, setCiclo] = useState("mensal");
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [cardData, setCardData] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: ""
  });

  const planoAtual = subscription?.assinatura?.plano;
  const isAtivo = subscription?.assinatura?.isAtiva;

  const handleSelectPlano = (plano) => {
    if (plano === planoAtual && isAtivo) {
      showToast?.("Você já está neste plano", "info");
      return;
    }
    setSelectedPlano(plano);
    setShowCheckout(true);
  };

  const handleIniciarTrial = async () => {
    setProcessando(true);
    const result = await iniciarTrial();
    setProcessando(false);
    
    if (result.success) {
      showToast?.("Trial de 7 dias iniciado! Aproveite!", "success");
      setLocation("/dashboard");
    } else {
      showToast?.(result.error, "error");
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!selectedPlano) return;
    
    // Validação básica
    if (!cardData.numero || !cardData.nome || !cardData.validade || !cardData.cvv) {
      showToast?.("Preencha todos os dados do cartão", "error");
      return;
    }
    
    setProcessando(true);
    
    // Simular processamento (integrar com gateway real depois)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await criarAssinatura(selectedPlano, ciclo, {
      metodo: "cartao",
      ultimosDigitos: cardData.numero.slice(-4),
      bandeira: detectarBandeira(cardData.numero)
    });
    
    setProcessando(false);
    
    if (result.success) {
      showToast?.("Assinatura ativada com sucesso!", "success");
      setShowCheckout(false);
      setLocation("/dashboard");
    } else {
      showToast?.(result.error, "error");
    }
  };

  const detectarBandeira = (numero) => {
    if (numero.startsWith("4")) return "visa";
    if (numero.startsWith("5")) return "mastercard";
    if (numero.startsWith("3")) return "amex";
    return "outro";
  };

  const formatarCartao = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .slice(0, 19);
  };

  const formatarValidade = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="planos-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planos-page">
      {/* Header */}
      <div className="planos-header">
        <button className="back-btn" onClick={() => setLocation("/dashboard")}>
          <FiArrowLeft /> Voltar
        </button>
        <div className="header-content">
          <h1>Escolha seu Plano</h1>
          <p>Desbloqueie todo o potencial do IdentyFlow</p>
        </div>
      </div>

      {/* Trial Banner */}
      {!subscription?.temAssinatura && !subscription?.assinatura?.trialUsado && (
        <div className="trial-banner">
          <div className="trial-content">
            <FiZap className="trial-icon" />
            <div>
              <h3>Experimente Grátis por 7 dias!</h3>
              <p>Teste todas as funcionalidades do plano Starter sem compromisso</p>
            </div>
          </div>
          <button 
            className="trial-btn"
            onClick={handleIniciarTrial}
            disabled={processando}
          >
            {processando ? "Ativando..." : "Iniciar Trial Grátis"}
          </button>
        </div>
      )}

      {/* Ciclo Toggle */}
      <div className="ciclo-toggle">
        <button 
          className={ciclo === "mensal" ? "active" : ""}
          onClick={() => setCiclo("mensal")}
        >
          Mensal
        </button>
        <button 
          className={ciclo === "anual" ? "active" : ""}
          onClick={() => setCiclo("anual")}
        >
          Anual
          <span className="desconto">2 meses grátis</span>
        </button>
      </div>

      {/* Planos Grid */}
      <div className="planos-grid">
        {Object.entries(PLANOS).map(([key, plano]) => (
          <div 
            key={key} 
            className={`plano-card ${plano.popular ? "popular" : ""} ${planoAtual === key ? "atual" : ""}`}
          >
            {plano.popular && <div className="popular-badge">Mais Popular</div>}
            {planoAtual === key && isAtivo && (
              <div className="atual-badge">Seu Plano Atual</div>
            )}
            
            <div className="plano-header">
              <h2>{plano.nome}</h2>
              <p className="plano-desc">{plano.descricao}</p>
              
              {/* Preço com promoção */}
              {ciclo === "mensal" && plano.precoOriginal && (
                <div className="preco-promo">
                  <span className="preco-original">
                    de R$ {plano.precoOriginal.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="promo-badge">
                    {plano.mesesPromocao} meses
                  </span>
                </div>
              )}
              
              <div className="plano-preco">
                <span className="por-label">por</span>
                <span className="moeda">R$</span>
                <span className="valor">
                  {ciclo === "anual" 
                    ? (plano.precoAnual / 12).toFixed(2).replace(".", ",")
                    : plano.preco.toFixed(2).replace(".", ",")}
                </span>
                <span className="periodo">/mês</span>
              </div>
              
              {ciclo === "mensal" && plano.mesesPromocao && (
                <p className="promo-info">
                  nos primeiros {plano.mesesPromocao} meses
                </p>
              )}
              
              {ciclo === "anual" && (
                <p className="preco-anual">
                  R$ {plano.precoAnual.toFixed(2).replace(".", ",")} /ano
                </p>
              )}
            </div>

            <div className="plano-features">
              <h4>Incluso:</h4>
              <ul className="features-list">
                {plano.beneficios.map((item, i) => (
                  <li key={i} className="feature-item included">
                    <FiCheck /> {item}
                  </li>
                ))}
              </ul>
              
              {plano.naoInclui.length > 0 && (
                <>
                  <h4 className="nao-inclui-title">Não incluso:</h4>
                  <ul className="features-list">
                    {plano.naoInclui.map((item, i) => (
                      <li key={i} className="feature-item excluded">
                        <FiX /> {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="plano-limites">
              <div className="limite-item">
                <span>Alunos/ano</span>
                <strong>{plano.limites.alunosAno.toLocaleString()}</strong>
              </div>
              <div className="limite-item">
                <span>Cursos</span>
                <strong>{plano.limites.cursos}</strong>
              </div>
              <div className="limite-item">
                <span>Instrutores</span>
                <strong>{plano.limites.instrutores}</strong>
              </div>
            </div>

            <button 
              className={`plano-btn ${plano.popular ? "primary" : "secondary"}`}
              onClick={() => handleSelectPlano(key)}
              disabled={planoAtual === key && isAtivo}
            >
              {planoAtual === key && isAtivo 
                ? "Plano Atual" 
                : planoAtual === "starter" && key === "premium"
                  ? "Fazer Upgrade"
                  : "Assinar Agora"
              }
            </button>
          </div>
        ))}
      </div>

      {/* Status da Assinatura Atual */}
      {subscription?.temAssinatura && (
        <div className="assinatura-status">
          <FiShield className="status-icon" />
          <div className="status-info">
            <h4>Sua Assinatura</h4>
            <p>
              Plano <strong>{subscription.assinatura.planoNome}</strong>
              {" • "}
              Status: <span className={`status-${subscription.assinatura.status}`}>
                {subscription.assinatura.status}
              </span>
            </p>
            {subscription.assinatura.dataExpiracao && (
              <p className="expira">
                <FiCalendar /> Válido até {new Date(subscription.assinatura.dataExpiracao).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedPlano && (
        <div className="checkout-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <button className="close-checkout" onClick={() => setShowCheckout(false)}>
              <FiX />
            </button>
            
            <h2><FiCreditCard /> Finalizar Assinatura</h2>
            
            <div className="checkout-resumo">
              <div className="resumo-plano">
                <span>Plano {PLANOS[selectedPlano].nome}</span>
                <strong>
                  R$ {ciclo === "anual" 
                    ? PLANOS[selectedPlano].precoAnual.toFixed(2).replace(".", ",")
                    : PLANOS[selectedPlano].preco.toFixed(2).replace(".", ",")
                  }
                  /{ciclo === "anual" ? "ano" : "mês"}
                </strong>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="form-group">
                <label>Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.numero}
                  onChange={e => setCardData({...cardData, numero: formatarCartao(e.target.value)})}
                  maxLength={19}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nome no Cartão</label>
                <input
                  type="text"
                  placeholder="NOME COMPLETO"
                  value={cardData.nome}
                  onChange={e => setCardData({...cardData, nome: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Validade</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardData.validade}
                    onChange={e => setCardData({...cardData, validade: formatarValidade(e.target.value)})}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="000"
                    value={cardData.cvv}
                    onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4)})}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="checkout-seguranca">
                <FiShield />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>

              <button 
                type="submit" 
                className="checkout-btn"
                disabled={processando}
              >
                {processando ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <FiCreditCard />
                    Confirmar Pagamento
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
