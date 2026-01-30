import { useEffect, useState } from "react";
import { FiUsers, FiBook, FiUserCheck, FiTrendingUp, FiCalendar, FiAward } from "react-icons/fi";
import api from "../services/api";
import "../styles/DashboardHome.css";

export default function DashboardHome({ showToast }) {
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
      <div className="dashboard-header">
        <h1>📊 Painel de Controle</h1>
        <p className="dashboard-subtitle">Visão geral do sistema IdentyFlow</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <FiUsers size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalAlunos || 0}</span>
            <span className="stat-label">Total de Alunos</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <FiBook size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalCursos || 0}</span>
            <span className="stat-label">Cursos Ativos</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <FiUserCheck size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalUsuarios || 0}</span>
            <span className="stat-label">Usuários do Sistema</span>
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
        </div>

        <div className="stat-card stat-accent">
          <div className="stat-icon">
            <FiCalendar size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.alunosHoje || 0}</span>
            <span className="stat-label">Cadastros Hoje</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <FiAward size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {stats?.cursosPorAluno?.[0]?.count || 0}
            </span>
            <span className="stat-label">Curso Mais Popular</span>
          </div>
        </div>
      </div>

      {/* Seção de Detalhes */}
      <div className="dashboard-details">
        {/* Últimos Cadastros */}
        <div className="detail-card">
          <div className="detail-header">
            <h3>📝 Últimos Cadastros</h3>
          </div>
          <div className="detail-content">
            {stats?.ultimosAlunos?.length > 0 ? (
              <ul className="recent-list">
                {stats.ultimosAlunos.map((aluno, idx) => (
                  <li key={idx} className="recent-item">
                    <div className="recent-avatar">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{aluno.nome}</span>
                      <span className="recent-course">
                        {Array.isArray(aluno.cursos) 
                          ? aluno.cursos.join(", ") 
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
              <p className="no-data">Nenhum cadastro recente</p>
            )}
          </div>
        </div>

        {/* Cursos Mais Populares */}
        <div className="detail-card">
          <div className="detail-header">
            <h3>🏆 Cursos Mais Populares</h3>
          </div>
          <div className="detail-content">
            {stats?.cursosPorAluno?.length > 0 ? (
              <ul className="popular-list">
                {stats.cursosPorAluno.map((curso, idx) => (
                  <li key={idx} className="popular-item">
                    <div className="popular-rank">{idx + 1}º</div>
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
                    <span className="popular-count">{curso.count} alunos</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
