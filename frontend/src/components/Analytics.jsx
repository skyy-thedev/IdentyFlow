import { useState, useEffect } from "react";
import api from "../services/api";
import { 
  FiTrendingUp, 
  FiBarChart2, 
  FiPieChart,
  FiCalendar,
  FiUsers,
  FiBook,
  FiTarget,
  FiDollarSign,
  FiClock,
  FiLock,
  FiAward
} from "react-icons/fi";
import { FeatureGate } from "./SubscriptionGuard";
import "../styles/Analytics.css";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [cursosPopulares, setCursosPopulares] = useState([]);
  const [cadastrosPorMes, setCadastrosPorMes] = useState([]);
  const [alunosPorTurma, setAlunosPorTurma] = useState([]);
  const [alunosPorCurso, setAlunosPorCurso] = useState([]);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCursos: 0,
    alunosMes: 0,
    crescimento: 0,
    alunosSemana: 0,
    totalAlunosDB: 0,
    totalTurmas: 0,
    mediaAlunosPorTurma: 0,
    faturamentoMes: 0,
    faturamentoAnual: 0,
    mediaFaturamentoMensal: 0,
    expectativaFaturamento: 0
  });
  const [metaInscricao, setMetaInscricao] = useState(100);
  const [showMetaModal, setShowMetaModal] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // Carregar meta salva
    const metaSalva = localStorage.getItem("metaInscricaoMensal");
    if (metaSalva) setMetaInscricao(parseInt(metaSalva));
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

      // Alunos por turma
      if (analyticsRes.data?.alunosPorTurma) {
        setAlunosPorTurma(analyticsRes.data.alunosPorTurma);
      }
      
      // Alunos por curso
      if (analyticsRes.data?.alunosPorCurso) {
        setAlunosPorCurso(analyticsRes.data.alunosPorCurso);
      }
      
      // Calcular crescimento
      const crescimento = analyticsRes.data?.taxaCrescimento || 0;

      setStats({
        totalAlunos: dashRes.data?.totalAlunos || 0,
        totalCursos: dashRes.data?.totalCursos || 0,
        alunosMes: analyticsRes.data?.alunosMes || analyticsRes.data?.alunosMesAtual || 0,
        crescimento,
        alunosSemana: analyticsRes.data?.alunosSemana || 0,
        totalAlunosDB: analyticsRes.data?.totalAlunosDB || 0,
        totalTurmas: analyticsRes.data?.totalTurmas || 0,
        mediaAlunosPorTurma: analyticsRes.data?.mediaAlunosPorTurma || 0,
        faturamentoMes: analyticsRes.data?.faturamentoMes || 0,
        faturamentoAnual: analyticsRes.data?.faturamentoAnual || 0,
        mediaFaturamentoMensal: analyticsRes.data?.mediaFaturamentoMensal || 0,
        expectativaFaturamento: analyticsRes.data?.expectativaFaturamento || 0
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleSaveMeta = () => {
    localStorage.setItem("metaInscricaoMensal", metaInscricao.toString());
    setShowMetaModal(false);
  };

  const progressoMeta = Math.min((stats.alunosMes / metaInscricao) * 100, 100);

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

      {/* KPI Cards - Principais */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <FiUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalAlunosDB}</span>
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
          <div className="kpi-icon orange">
            <FiCalendar />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.alunosSemana}</span>
            <span className="kpi-label">Inscritos na Semana</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <FiCalendar />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.alunosMes}</span>
            <span className="kpi-label">Inscritos no Mês</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon teal">
            <FiUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalTurmas}</span>
            <span className="kpi-label">Total de Turmas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon pink">
            <FiAward />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.mediaAlunosPorTurma}</span>
            <span className="kpi-label">Média Alunos/Turma</span>
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

      {/* Meta de Inscrição */}
      <div className="analytics-card meta-card">
        <div className="card-header">
          <h2><FiTarget /> Meta de Inscrição Mensal</h2>
          <button className="btn-edit-meta" onClick={() => setShowMetaModal(true)}>
            Editar Meta
          </button>
        </div>
        <div className="meta-content">
          <div className="meta-progress-container">
            <div className="meta-progress-bar">
              <div 
                className="meta-progress-fill"
                style={{ width: `${progressoMeta}%` }}
              />
            </div>
            <div className="meta-info">
              <span className="meta-current">{stats.alunosMes}</span>
              <span className="meta-separator">/</span>
              <span className="meta-target">{metaInscricao}</span>
            </div>
          </div>
          <p className="meta-percentage">
            {progressoMeta >= 100 ? "🎉 Meta atingida!" : `${progressoMeta.toFixed(0)}% da meta`}
          </p>
        </div>
      </div>

      {/* KPI Cards - Financeiro */}
      <h2 className="section-title"><FiDollarSign /> Métricas Financeiras</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon green">
            <FiDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatCurrency(stats.faturamentoMes)}</span>
            <span className="kpi-label">Faturamento do Mês</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <FiDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatCurrency(stats.mediaFaturamentoMensal)}</span>
            <span className="kpi-label">Média Faturamento Mensal</span>
          </div>
        </div>

        {/* Features Premium - Faturamento Anual */}
        <FeatureGate feature="faturamentoAnual" fallback={
          <div className="kpi-card premium-locked">
            <div className="kpi-icon locked">
              <FiLock />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">***</span>
              <span className="kpi-label">Faturamento Anual</span>
              <span className="premium-badge">Plus</span>
            </div>
          </div>
        }>
          <div className="kpi-card premium">
            <div className="kpi-icon gold">
              <FiDollarSign />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{formatCurrency(stats.faturamentoAnual)}</span>
              <span className="kpi-label">Faturamento Anual</span>
              <span className="premium-badge active">Plus</span>
            </div>
          </div>
        </FeatureGate>

        {/* Features Premium - Expectativa de Faturamento */}
        <FeatureGate feature="expectativaFaturamento" fallback={
          <div className="kpi-card premium-locked">
            <div className="kpi-icon locked">
              <FiLock />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">***</span>
              <span className="kpi-label">Expectativa 60 dias</span>
              <span className="premium-badge">Plus</span>
            </div>
          </div>
        }>
          <div className="kpi-card premium">
            <div className="kpi-icon gold">
              <FiClock />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{formatCurrency(stats.expectativaFaturamento)}</span>
              <span className="kpi-label">Expectativa 60 dias</span>
              <span className="premium-badge active">Plus</span>
            </div>
          </div>
        </FeatureGate>
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

      {/* Alunos por Turma */}
      <div className="analytics-card">
        <div className="card-header">
          <h2><FiUsers /> Alunos por Turma</h2>
        </div>
        <div className="popular-list">
          {alunosPorTurma.length > 0 ? (
            alunosPorTurma.map((turma, index) => (
              <div key={index} className="popular-item">
                <div className="popular-rank">#{index + 1}</div>
                <div className="popular-info">
                  <span className="popular-name">{turma.nome} {turma.horario && `(${turma.horario})`}</span>
                  <div className="popular-bar-container">
                    <div 
                      className="popular-bar"
                      style={{ 
                        width: `${(turma.total / (alunosPorTurma[0]?.total || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="popular-count">{turma.total} alunos</div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>Sem dados de turmas</p>
            </div>
          )}
        </div>
      </div>

      {/* Alunos por Curso - Detalhado */}
      <div className="analytics-card">
        <div className="card-header">
          <h2><FiBook /> Alunos por Curso (Detalhado)</h2>
        </div>
        <div className="popular-list">
          {alunosPorCurso.length > 0 ? (
            alunosPorCurso.map((curso, index) => (
              <div key={index} className="popular-item">
                <div className="popular-rank">#{index + 1}</div>
                <div className="popular-info">
                  <span className="popular-name">{curso._id || "Sem curso"}</span>
                  <div className="popular-bar-container">
                    <div 
                      className="popular-bar"
                      style={{ 
                        width: `${(curso.count / (alunosPorCurso[0]?.count || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="popular-count">{curso.count} alunos</div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>Sem dados de cursos</p>
            </div>
          )}
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
                ? `${Math.round(stats.totalAlunosDB / stats.totalCursos)} alunos por curso`
                : "Sem dados suficientes"
              }
            </p>
          </div>
          <div className="insight-card">
            <h3>Ticket Médio</h3>
            <p>
              {stats.alunosMes > 0 
                ? formatCurrency(stats.faturamentoMes / stats.alunosMes)
                : "Sem dados suficientes"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Modal para editar meta */}
      {showMetaModal && (
        <div className="modal-overlay" onClick={() => setShowMetaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Definir Meta de Inscrição Mensal</h3>
            <input
              type="number"
              value={metaInscricao}
              onChange={e => setMetaInscricao(parseInt(e.target.value) || 0)}
              min="1"
              className="meta-input"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowMetaModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSaveMeta}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
