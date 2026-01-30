import { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiDollarSign, 
  FiBook,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "../styles/InstructorDashboard.css";

export default function InstructorDashboard({ showToast }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    proximosAlunos: [],
    minhasTurmas: [],
    historicoAlunos: [],
    ganhosMes: 0,
    ganhosTotal: 0,
    turmasAtivas: 0,
    alunosAtendidos: 0
  });

  useEffect(() => {
    fetchInstructorStats();
  }, []);

  const fetchInstructorStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/stats/instrutor/${user.id}`);
      setStats(res.data);
    } catch (err) {
      console.error("Erro ao buscar stats do instrutor:", err);
      // Dados mock para fallback
      setStats({
        proximosAlunos: [],
        minhasTurmas: [],
        historicoAlunos: [],
        ganhosMes: 0,
        ganhosTotal: 0,
        turmasAtivas: 0,
        alunosAtendidos: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return "A definir";
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="instructor-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      {/* Header */}
      <div className="instructor-header">
        <div className="welcome-section">
          <h1>Olá, {user?.nome?.split(' ')[0] || 'Instrutor'}! 👋</h1>
          <p>Aqui está um resumo das suas atividades</p>
        </div>
        <div className="role-badge instrutor">
          <FiBook /> Instrutor
        </div>
      </div>

      {/* KPIs do Instrutor */}
      <div className="instructor-kpis">
        <div className="kpi-card earnings">
          <div className="kpi-icon">
            <FiDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Ganhos do Mês</span>
            <span className="kpi-value">{formatarValor(stats.ganhosMes)}</span>
          </div>
        </div>
        
        <div className="kpi-card total">
          <div className="kpi-icon">
            <FiTrendingUp />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Acumulado</span>
            <span className="kpi-value">{formatarValor(stats.ganhosTotal)}</span>
          </div>
        </div>
        
        <div className="kpi-card turmas">
          <div className="kpi-icon">
            <FiCalendar />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Turmas Ativas</span>
            <span className="kpi-value">{stats.turmasAtivas}</span>
          </div>
        </div>
        
        <div className="kpi-card alunos">
          <div className="kpi-icon">
            <FiUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Alunos Atendidos</span>
            <span className="kpi-value">{stats.alunosAtendidos}</span>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="instructor-grid">
        {/* Próximos Alunos */}
        <div className="instructor-card proximos-alunos">
          <div className="card-header">
            <h3><FiUsers /> Próximos Alunos</h3>
            <span className="badge">{stats.proximosAlunos?.length || 0}</span>
          </div>
          <div className="card-body">
            {stats.proximosAlunos?.length > 0 ? (
              <div className="alunos-list">
                {stats.proximosAlunos.slice(0, 5).map((aluno, index) => (
                  <div key={index} className="aluno-item">
                    <div className="aluno-avatar">
                      {aluno.nome?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="aluno-info">
                      <span className="aluno-nome">{aluno.nome}</span>
                      <span className="aluno-curso">{aluno.curso}</span>
                    </div>
                    <div className="aluno-data">
                      <FiCalendar />
                      {formatarData(aluno.dataInicio)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiUsers size={40} />
                <p>Nenhum aluno agendado</p>
              </div>
            )}
          </div>
        </div>

        {/* Minhas Turmas */}
        <div className="instructor-card minhas-turmas">
          <div className="card-header">
            <h3><FiCalendar /> Minhas Turmas</h3>
            <span className="badge">{stats.minhasTurmas?.length || 0}</span>
          </div>
          <div className="card-body">
            {stats.minhasTurmas?.length > 0 ? (
              <div className="turmas-list">
                {stats.minhasTurmas.slice(0, 5).map((turma, index) => (
                  <div key={index} className="turma-item">
                    <div className="turma-header">
                      <span className="turma-curso">{turma.cursoNome}</span>
                      <span className={`turma-status ${turma.status}`}>
                        {turma.status === "ativa" ? (
                          <><FiCheckCircle /> Ativa</>
                        ) : (
                          <><FiClock /> {turma.status}</>
                        )}
                      </span>
                    </div>
                    <div className="turma-details">
                      <span><FiCalendar /> {formatarData(turma.dataInicio)}</span>
                      <span><FiClock /> {turma.horario || "A definir"}</span>
                      <span><FiUsers /> {turma.alunosInscritos}/{turma.capacidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiCalendar size={40} />
                <p>Nenhuma turma atribuída</p>
              </div>
            )}
          </div>
        </div>

        {/* Histórico de Alunos */}
        <div className="instructor-card historico">
          <div className="card-header">
            <h3><FiBook /> Histórico</h3>
            <span className="badge">{stats.historicoAlunos?.length || 0}</span>
          </div>
          <div className="card-body">
            {stats.historicoAlunos?.length > 0 ? (
              <div className="historico-list">
                {stats.historicoAlunos.slice(0, 8).map((item, index) => (
                  <div key={index} className="historico-item">
                    <div className="historico-avatar">
                      {item.alunoNome?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="historico-info">
                      <span className="historico-nome">{item.alunoNome}</span>
                      <span className="historico-curso">{item.curso}</span>
                    </div>
                    <div className="historico-data">
                      {formatarData(item.dataConclusao)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiBook size={40} />
                <p>Nenhum histórico ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem Informativa */}
      <div className="instructor-info-banner">
        <FiAlertCircle />
        <p>
          <strong>Modo Instrutor:</strong> Você está visualizando apenas as informações 
          relacionadas às suas turmas e alunos. Para acesso completo ao sistema, 
          entre em contato com um administrador.
        </p>
      </div>
    </div>
  );
}
