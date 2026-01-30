import { useState, useEffect } from "react";
import api from "../services/api";
import { 
  FiTrendingUp, 
  FiBarChart2, 
  FiPieChart,
  FiCalendar,
  FiUsers,
  FiBook
} from "react-icons/fi";
import "../styles/Analytics.css";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [cursosPopulares, setCursosPopulares] = useState([]);
  const [cadastrosPorMes, setCadastrosPorMes] = useState([]);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCursos: 0,
    alunosMes: 0,
    crescimento: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do dashboard e analytics em paralelo
      const [dashRes, analyticsRes] = await Promise.all([
        api.get("/stats/dashboard"),
        api.get("/stats/analytics")
      ]);

      // Cursos populares do dashboard
      const cursos = Array.isArray(dashRes.data?.cursosPorAluno) 
        ? dashRes.data.cursosPorAluno.map(c => ({ nome: c._id, total: c.count }))
        : [];
      setCursosPopulares(cursos);
      
      // Cadastros por mês do analytics
      const meses = Array.isArray(analyticsRes.data?.cadastrosPorMes) 
        ? analyticsRes.data.cadastrosPorMes.map(m => ({ 
            mes: m._id.mes, 
            ano: m._id.ano, 
            total: m.count 
          }))
        : [];
      setCadastrosPorMes(meses);
      
      // Calcular crescimento
      const crescimento = analyticsRes.data?.taxaCrescimento || 0;

      setStats({
        totalAlunos: dashRes.data?.totalAlunos || 0,
        totalCursos: dashRes.data?.totalCursos || 0,
        alunosMes: analyticsRes.data?.alunosMesAtual || dashRes.data?.alunosRecentes || 0,
        crescimento
      });
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMesNome = (mesNum) => {
    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    return meses[mesNum - 1] || mesNum;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Carregando analytics...</p>
        </div>
      </div>
    );
  }

  const maxCadastros = cadastrosPorMes.length > 0 
    ? Math.max(...cadastrosPorMes.map(m => m.total), 1) 
    : 1;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>
          <FiBarChart2 /> Analytics
        </h1>
        <p>Visualize o desempenho e crescimento da plataforma</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <FiUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalAlunos}</span>
            <span className="kpi-label">Total de Alunos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <FiBook />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalCursos}</span>
            <span className="kpi-label">Cursos Ativos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <FiCalendar />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.alunosMes}</span>
            <span className="kpi-label">Cadastros este Mês</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className={`kpi-icon ${stats.crescimento >= 0 ? 'green' : 'red'}`}>
            <FiTrendingUp />
          </div>
          <div className="kpi-content">
            <span className={`kpi-value ${stats.crescimento >= 0 ? 'positive' : 'negative'}`}>
              {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento}%
            </span>
            <span className="kpi-label">Crescimento Mensal</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Gráfico de Cadastros por Mês */}
        <div className="analytics-card chart-card">
          <div className="card-header">
            <h2>
              <FiTrendingUp /> Cadastros por Mês
            </h2>
          </div>
          <div className="chart-container bar-chart">
            {cadastrosPorMes.length > 0 ? (
              <div className="bars-wrapper">
                {cadastrosPorMes.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${(item.total / maxCadastros) * 100}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <span className="bar-value">{item.total}</span>
                      </div>
                    </div>
                    <span className="bar-label">{getMesNome(item.mes)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>Sem dados de cadastros</p>
              </div>
            )}
          </div>
        </div>

        {/* Cursos Mais Populares */}
        <div className="analytics-card">
          <div className="card-header">
            <h2>
              <FiPieChart /> Cursos Mais Populares
            </h2>
          </div>
          <div className="popular-list">
            {cursosPopulares.length > 0 ? (
              cursosPopulares.map((curso, index) => (
                <div key={index} className="popular-item">
                  <div className="popular-rank">#{index + 1}</div>
                  <div className="popular-info">
                    <span className="popular-name">{curso.nome || "Sem curso"}</span>
                    <div className="popular-bar-container">
                      <div 
                        className="popular-bar"
                        style={{ 
                          width: `${(curso.total / (cursosPopulares[0]?.total || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="popular-count">{curso.total} alunos</div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>Sem dados de cursos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h2>💡 Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Melhor Mês</h3>
            <p>
              {cadastrosPorMes.length > 0 
                ? (() => {
                    const melhorMes = cadastrosPorMes.reduce((max, m) => (m.total > max.total ? m : max), cadastrosPorMes[0]);
                    return `${getMesNome(melhorMes.mes)} com ${melhorMes.total} cadastros`;
                  })()
                : "Sem dados suficientes"
              }
            </p>
          </div>
          <div className="insight-card">
            <h3>Curso Líder</h3>
            <p>
              {cursosPopulares.length > 0 
                ? `${cursosPopulares[0].nome || "N/A"} com ${cursosPopulares[0].total} alunos`
                : "Sem dados suficientes"
              }
            </p>
          </div>
          <div className="insight-card">
            <h3>Média de Alunos/Curso</h3>
            <p>
              {stats.totalCursos > 0 
                ? `${Math.round(stats.totalAlunos / stats.totalCursos)} alunos por curso`
                : "Sem dados suficientes"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
