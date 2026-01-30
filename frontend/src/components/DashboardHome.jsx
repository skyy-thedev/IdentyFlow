import { useEffect, useState } from "react";
import { 
  FiUsers, FiBook, FiUserCheck, FiTrendingUp, FiCalendar, 
  FiAward, FiArrowRight, FiBarChart2, FiLayers, FiPlusCircle,
  FiClock, FiCheckCircle, FiActivity, FiTarget, FiZap
} from "react-icons/fi";
import api from "../services/api";
import "../styles/DashboardHome.css";

export default function DashboardHome({ showToast, setActiveSection }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        if (showToast) showToast("Erro ao carregar estatísticas", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const navigateTo = (section) => {
    if (setActiveSection) {
      setActiveSection(section);
    }
  };

  // Calcular taxa de crescimento
  const getTaxaCrescimento = () => {
    if (!stats?.alunosRecentes || !stats?.totalAlunos) return 0;
    const taxaBase = stats.totalAlunos > 0 ? (stats.alunosRecentes / stats.totalAlunos) * 100 : 0;
    return taxaBase.toFixed(1);
  };

  // Calcular média de alunos por curso
  const getMediaAlunosPorCurso = () => {
    if (!stats?.totalAlunos || !stats?.totalCursos || stats.totalCursos === 0) return 0;
    return (stats.totalAlunos / stats.totalCursos).toFixed(1);
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Header com saudação */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Painel de Controle</h1>
          <p className="dashboard-subtitle">
            Bem-vindo ao IdentyFlow — Aqui está o panorama geral do sistema
          </p>
        </div>
        <div className="header-date">
          <FiCalendar />
          <span>{new Date().toLocaleDateString("pt-BR", { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <h2 className="section-title">
          <FiZap /> Ações Rápidas
        </h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigateTo("cadastroAlunos")}>
            <div className="action-icon bg-primary">
              <FiPlusCircle size={24} />
            </div>
            <div className="action-info">
              <span className="action-title">Novo Aluno</span>
              <span className="action-desc">Cadastrar aluno</span>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>

          <button className="action-card" onClick={() => navigateTo("alunos")}>
            <div className="action-icon bg-success">
              <FiUsers size={24} />
            </div>
            <div className="action-info">
              <span className="action-title">Ver Alunos</span>
              <span className="action-desc">{stats?.totalAlunos || 0} cadastrados</span>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>

          <button className="action-card" onClick={() => navigateTo("cursos")}>
            <div className="action-icon bg-info">
              <FiBook size={24} />
            </div>
            <div className="action-info">
              <span className="action-title">Cursos</span>
              <span className="action-desc">{stats?.totalCursos || 0} ativos</span>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>

          <button className="action-card" onClick={() => navigateTo("turmas")}>
            <div className="action-icon bg-warning">
              <FiLayers size={24} />
            </div>
            <div className="action-info">
              <span className="action-title">Turmas</span>
              <span className="action-desc">Gerenciar turmas</span>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>

          <button className="action-card" onClick={() => navigateTo("analytics")}>
            <div className="action-icon bg-purple">
              <FiBarChart2 size={24} />
            </div>
            <div className="action-info">
              <span className="action-title">Analytics</span>
              <span className="action-desc">Ver estatísticas</span>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>

          <button className="action-card" onClick={() => navigateTo("usuarios")}>
            <div className="action-icon bg-accent">
              <FiUserCheck size={24} />
            </div>
            <div className="action-info">
              <span className="action-title">Usuários</span>
              <span className="action-desc">{stats?.totalUsuarios || 0} ativos</span>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="stats-section">
        <h2 className="section-title">
          <FiActivity /> Métricas Principais
        </h2>
        <div className="stats-grid">
          <div className="stat-card stat-primary clickable" onClick={() => navigateTo("alunos")}>
            <div className="stat-icon">
              <FiUsers size={28} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.totalAlunos || 0}</span>
              <span className="stat-label">Total de Alunos</span>
            </div>
            <div className="stat-badge">
              <FiArrowRight size={16} />
            </div>
          </div>

          <div className="stat-card stat-success clickable" onClick={() => navigateTo("cursos")}>
            <div className="stat-icon">
              <FiBook size={28} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.totalCursos || 0}</span>
              <span className="stat-label">Cursos Ativos</span>
            </div>
            <div className="stat-badge">
              <FiArrowRight size={16} />
            </div>
          </div>

          <div className="stat-card stat-info clickable" onClick={() => navigateTo("usuarios")}>
            <div className="stat-icon">
              <FiUserCheck size={28} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.totalUsuarios || 0}</span>
              <span className="stat-label">Usuários</span>
            </div>
            <div className="stat-badge">
              <FiArrowRight size={16} />
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <FiTrendingUp size={28} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.alunosRecentes || 0}</span>
              <span className="stat-label">Novos (7 dias)</span>
            </div>
            <span className="stat-trend positive">+{getTaxaCrescimento()}%</span>
          </div>

          <div className="stat-card stat-accent">
            <div className="stat-icon">
              <FiCalendar size={28} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.alunosHoje || 0}</span>
              <span className="stat-label">Cadastros Hoje</span>
            </div>
            <span className="stat-indicator">
              <FiClock size={14} /> Atualizado
            </span>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <FiTarget size={28} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{getMediaAlunosPorCurso()}</span>
              <span className="stat-label">Média/Curso</span>
            </div>
            <span className="stat-indicator">
              <FiCheckCircle size={14} /> Meta
            </span>
          </div>
        </div>
      </div>

      {/* Seção de Detalhes em Grid */}
      <div className="details-section">
        {/* Últimos Cadastros */}
        <div className="detail-card">
          <div className="detail-header">
            <h3><FiClock /> Últimos Cadastros</h3>
            <button className="detail-link" onClick={() => navigateTo("historico")}>
              Ver todos <FiArrowRight />
            </button>
          </div>
          <div className="detail-content">
            {stats?.ultimosAlunos?.length > 0 ? (
              <ul className="recent-list">
                {stats.ultimosAlunos.slice(0, 5).map((aluno, idx) => (
                  <li key={idx} className="recent-item">
                    <div className="recent-avatar">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{aluno.nome}</span>
                      <span className="recent-course">
                        {Array.isArray(aluno.cursos) 
                          ? aluno.cursos.slice(0, 2).join(", ") + (aluno.cursos.length > 2 ? "..." : "")
                          : aluno.cursos || "Sem curso"}
                      </span>
                    </div>
                    <span className="recent-date">
                      {formatDate(aluno.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-data">
                <FiUsers size={40} />
                <p>Nenhum cadastro recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Cursos Mais Populares */}
        <div className="detail-card">
          <div className="detail-header">
            <h3><FiAward /> Cursos Mais Populares</h3>
            <button className="detail-link" onClick={() => navigateTo("analytics")}>
              Análise completa <FiArrowRight />
            </button>
          </div>
          <div className="detail-content">
            {stats?.cursosPorAluno?.length > 0 ? (
              <ul className="popular-list">
                {stats.cursosPorAluno.slice(0, 5).map((curso, idx) => (
                  <li key={idx} className="popular-item">
                    <div className={`popular-rank rank-${idx + 1}`}>
                      {idx + 1}º
                    </div>
                    <div className="popular-info">
                      <span className="popular-name">{curso._id}</span>
                      <div className="popular-bar">
                        <div 
                          className="popular-bar-fill"
                          style={{ 
                            width: `${(curso.count / stats.cursosPorAluno[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="popular-count">{curso.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-data">
                <FiBook size={40} />
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo do Sistema */}
        <div className="detail-card summary-card">
          <div className="detail-header">
            <h3><FiActivity /> Resumo do Sistema</h3>
          </div>
          <div className="detail-content">
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon bg-primary">
                  <FiUsers size={20} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{stats?.totalAlunos || 0}</span>
                  <span className="summary-label">Alunos</span>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon bg-success">
                  <FiBook size={20} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{stats?.totalCursos || 0}</span>
                  <span className="summary-label">Cursos</span>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon bg-warning">
                  <FiTrendingUp size={20} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">+{getTaxaCrescimento()}%</span>
                  <span className="summary-label">Crescimento</span>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon bg-info">
                  <FiTarget size={20} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{getMediaAlunosPorCurso()}</span>
                  <span className="summary-label">Média/Curso</span>
                </div>
              </div>
            </div>

            <div className="summary-footer">
              <div className="summary-stat">
                <span className="summary-stat-label">Curso mais popular:</span>
                <span className="summary-stat-value">
                  {stats?.cursosPorAluno?.[0]?._id || "N/A"}
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Com {stats?.cursosPorAluno?.[0]?.count || 0} alunos matriculados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de Ajuda */}
      <div className="dashboard-footer">
        <div className="footer-tip">
          <FiZap />
          <span><strong>Dica:</strong> Clique nos cards de estatísticas para acessar rapidamente cada seção.</span>
        </div>
      </div>
    </div>
  );
}
