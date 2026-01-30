import { useEffect, useState, useCallback } from "react";
import {
  FiActivity, FiUsers, FiTrendingUp, FiDollarSign, FiClock,
  FiStar, FiAlertCircle, FiCheckCircle, FiXCircle, FiRefreshCw,
  FiPieChart, FiBarChart2, FiCalendar, FiServer, FiDatabase
} from "react-icons/fi";
import api from "../services/api";
import "../styles/GodDashboard.css";

export default function GodDashboard({ showToast }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/stats/god-metrics");
      setMetrics(res.data);
    } catch (err) {
      console.error("Erro ao buscar métricas GOD:", err);
      if (showToast) showToast("Erro ao carregar métricas", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="god-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="god-dashboard">
      {/* Header */}
      <div className="god-header">
        <div className="header-content">
          <h1>⚡ Painel GOD</h1>
          <p className="subtitle">Métricas avançadas e controle total do sistema</p>
        </div>
        <button className="btn-refresh" onClick={fetchMetrics}>
          <FiRefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* Métricas de Usuários */}
      <section className="metrics-section">
        <h2 className="section-title">
          <FiUsers /> Métricas de Usuários
        </h2>
        <div className="metrics-grid">
          <div className="metric-card highlight-blue">
            <div className="metric-icon">
              <FiUsers size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.usuarios?.total || 0}</span>
              <span className="metric-label">Total de Usuários</span>
            </div>
          </div>

          <div className="metric-card highlight-green">
            <div className="metric-icon">
              <FiActivity size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.usuarios?.ativosHoje || 0}</span>
              <span className="metric-label">Ativos Hoje</span>
            </div>
          </div>

          <div className="metric-card highlight-purple">
            <div className="metric-icon">
              <FiTrendingUp size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.usuarios?.picoSimultaneo || 0}</span>
              <span className="metric-label">Pico Simultâneo</span>
            </div>
          </div>

          <div className="metric-card highlight-orange">
            <div className="metric-icon">
              <FiClock size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.usuarios?.mediaUsoMinutos || 0}min</span>
              <span className="metric-label">Média de Uso</span>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas de Assinaturas */}
      <section className="metrics-section">
        <h2 className="section-title">
          <FiStar /> Assinaturas
        </h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon icon-starter">
              <FiCheckCircle size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.assinaturas?.starter || 0}</span>
              <span className="metric-label">Plano Starter</span>
            </div>
            <div className="metric-badge badge-gray">R$79,90</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon icon-premium">
              <FiStar size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.assinaturas?.premium || 0}</span>
              <span className="metric-label">Plano Premium</span>
            </div>
            <div className="metric-badge badge-gold">R$149,90</div>
          </div>

          <div className="metric-card highlight-red">
            <div className="metric-icon">
              <FiXCircle size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.assinaturas?.cancelados || 0}</span>
              <span className="metric-label">Cancelamentos</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiAlertCircle size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.assinaturas?.vencemEm30Dias || 0}</span>
              <span className="metric-label">Vencem em 30 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas Financeiras */}
      <section className="metrics-section">
        <h2 className="section-title">
          <FiDollarSign /> Receita
        </h2>
        <div className="metrics-grid wide">
          <div className="metric-card large highlight-green">
            <div className="metric-icon">
              <FiDollarSign size={28} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{formatCurrency(metrics?.receita?.mensal)}</span>
              <span className="metric-label">Receita Mensal (MRR)</span>
            </div>
          </div>

          <div className="metric-card large highlight-blue">
            <div className="metric-icon">
              <FiBarChart2 size={28} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{formatCurrency(metrics?.receita?.anual)}</span>
              <span className="metric-label">Receita Anual Projetada (ARR)</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiPieChart size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{formatCurrency(metrics?.receita?.ticketMedio)}</span>
              <span className="metric-label">Ticket Médio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Distribuição por Role */}
      <section className="metrics-section">
        <h2 className="section-title">
          <FiPieChart /> Distribuição por Função
        </h2>
        <div className="distribution-grid">
          <div className="distribution-card">
            <div className="distribution-bar">
              <div className="bar-fill god" style={{ width: `${metrics?.distribuicao?.godPercent || 0}%` }}></div>
            </div>
            <div className="distribution-info">
              <span className="role-name">GOD</span>
              <span className="role-count">{metrics?.distribuicao?.god || 0}</span>
            </div>
          </div>
          
          <div className="distribution-card">
            <div className="distribution-bar">
              <div className="bar-fill admin" style={{ width: `${metrics?.distribuicao?.adminPercent || 0}%` }}></div>
            </div>
            <div className="distribution-info">
              <span className="role-name">Admin</span>
              <span className="role-count">{metrics?.distribuicao?.admin || 0}</span>
            </div>
          </div>

          <div className="distribution-card">
            <div className="distribution-bar">
              <div className="bar-fill instrutor" style={{ width: `${metrics?.distribuicao?.instrutorPercent || 0}%` }}></div>
            </div>
            <div className="distribution-info">
              <span className="role-name">Instrutor</span>
              <span className="role-count">{metrics?.distribuicao?.instrutor || 0}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas do Sistema */}
      <section className="metrics-section">
        <h2 className="section-title">
          <FiServer /> Sistema
        </h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FiDatabase size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.sistema?.totalAlunos || 0}</span>
              <span className="metric-label">Total Alunos</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiCalendar size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.sistema?.alunosEsteMes || 0}</span>
              <span className="metric-label">Novos Este Mês</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiTrendingUp size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-value">{metrics?.sistema?.crescimentoPercent || 0}%</span>
              <span className="metric-label">Crescimento</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
