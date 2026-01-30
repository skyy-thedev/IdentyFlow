import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "./RoleGuard";
import { 
  FiUsers, 
  FiPlus, 
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiBook,
  FiCalendar,
  FiClock
} from "react-icons/fi";
import Toast from "./Toast";
import Modal from "./Modal";
import '../styles/turmas.css';

export default function Turmas() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const { canEdit, canDelete, isInstrutor } = useRole();
  
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [instrutores, setInstrutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [editingTurma, setEditingTurma] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    cursoId: "",
    instrutorId: "",
    dataInicio: "",
    dataFim: "",
    horario: "",
    capacidade: 30,
    status: "ativa"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const requests = [
        api.get("/turmas").catch(() => ({ data: [] })),
        api.get("/cursos").catch(() => ({ data: [] }))
      ];
      
      // Só buscar instrutores se não for instrutor
      if (!isInstrutor) {
        requests.push(api.get("/turmas/instrutores").catch(() => ({ data: [] })));
      }
      
      const [turmasRes, cursosRes, instrutoresRes] = await Promise.all(requests);
      
      // Garantir que turmas é sempre um array
      let turmasData = turmasRes.data;
      turmasData = Array.isArray(turmasData) ? turmasData : [];
      
      setTurmas(turmasData);
      
      // Garantir que cursos é sempre um array
      // A API retorna { cursos: [...] } ou pode retornar array direto
      const cursosData = cursosRes.data?.cursos || cursosRes.data;
      setCursos(Array.isArray(cursosData) ? cursosData : []);
      
      // Instrutores
      if (instrutoresRes) {
        const instrutoresData = instrutoresRes.data;
        setInstrutores(Array.isArray(instrutoresData) ? instrutoresData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast("Erro ao carregar turmas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    if (!canEdit) {
      showToast("Você não tem permissão para criar turmas", "error");
      return;
    }
    setEditingTurma(null);
    setFormData({
      nome: "",
      cursoId: "",
      instrutorId: "",
      dataInicio: "",
      dataFim: "",
      horario: "",
      capacidade: 30,
      status: "ativa"
    });
    setShowModal(true);
  };

  const openEditModal = (turma) => {
    if (!canEdit) {
      showToast("Você não tem permissão para editar turmas", "error");
      return;
    }
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome || "",
      cursoId: turma.cursoId?._id || turma.cursoId || "",
      instrutorId: turma.instrutorId?._id || turma.instrutorId || "",
      dataInicio: turma.dataInicio ? turma.dataInicio.split("T")[0] : "",
      dataFim: turma.dataFim ? turma.dataFim.split("T")[0] : "",
      horario: turma.horario || "",
      capacidade: turma.capacidade || 30,
      status: turma.status || "ativa"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTurma) {
        await api.put(`/turmas/${editingTurma._id}`, formData);
        showToast("Turma atualizada com sucesso!", "success");
      } else {
        await api.post("/turmas", formData);
        showToast("Turma criada com sucesso!", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      showToast("Erro ao salvar turma", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta turma?")) return;
    try {
      await api.delete(`/turmas/${id}`);
      showToast("Turma excluída com sucesso!", "success");
      fetchData();
    } catch (error) {
      showToast("Erro ao excluir turma", "error");
    }
  };

  const getCursoNome = (cursoId) => {
    // Se cursoId já veio populado do backend (objeto)
    if (cursoId && typeof cursoId === "object") {
      return cursoId.nome || cursoId.titulo || "Sem curso";
    }
    // Se é string, buscar na lista de cursos
    if (!Array.isArray(cursos)) return "Sem curso";
    const curso = cursos.find(c => c._id === cursoId);
    return curso?.nome || curso?.titulo || "Sem curso";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ativa": return "status-ativa";
      case "concluida": return "status-concluida";
      case "cancelada": return "status-cancelada";
      default: return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const filteredTurmas = Array.isArray(turmas) ? turmas.filter(turma =>
    turma.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCursoNome(turma.cursoId)?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="turmas-page">
        <div className="turmas-loading">
          <div className="loading-spinner"></div>
          <p>Carregando turmas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="turmas-page">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        show={toast.show} 
      />

      <div className="turmas-header">
        <div className="header-left">
          <h1>
            <FiUsers /> {isInstrutor ? "Minhas Turmas" : "Turmas"}
          </h1>
          <p>{isInstrutor ? "Visualize suas turmas atribuídas" : "Gerencie as turmas dos cursos"}</p>
        </div>
        {canEdit && (
          <button className="btn-create" onClick={openCreateModal}>
            <FiPlus /> Nova Turma
          </button>
        )}
      </div>

      <div className="turmas-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="turmas-count">
          {filteredTurmas.length} turma(s) encontrada(s)
        </div>
      </div>

      {filteredTurmas.length === 0 ? (
        <div className="no-turmas">
          <FiUsers size={48} />
          <h3>Nenhuma turma encontrada</h3>
          <p>Crie uma nova turma para começar</p>
        </div>
      ) : (
        <div className="turmas-grid">
          {filteredTurmas.map(turma => (
            <div key={turma._id} className="turma-card">
              <div className="turma-header">
                <h3>{turma.nome}</h3>
                <span className={`status-badge ${getStatusClass(turma.status)}`}>
                  {turma.status || "ativa"}
                </span>
              </div>

              <div className="turma-info">
                <div className="info-item">
                  <FiBook />
                  <span>{getCursoNome(turma.cursoId)}</span>
                </div>
                <div className="info-item">
                  <FiCalendar />
                  <span>{formatDate(turma.dataInicio)} - {formatDate(turma.dataFim)}</span>
                </div>
                <div className="info-item">
                  <FiClock />
                  <span>{turma.horario || "Horário não definido"}</span>
                </div>
                <div className="info-item">
                  <FiUsers />
                  <span>{turma.alunosCount || 0}/{turma.capacidade || 30} alunos</span>
                </div>
              </div>

              <div className="turma-actions">
                {canEdit && (
                  <button 
                    className="btn-action edit"
                    onClick={() => openEditModal(turma)}
                    title="Editar"
                  >
                    <FiEdit2 />
                  </button>
                )}
                {canDelete && (
                  <button 
                    className="btn-action delete"
                    onClick={() => handleDelete(turma._id)}
                    title="Excluir"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="turma-modal">
          <h2>{editingTurma ? "Editar Turma" : "Nova Turma"}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome da Turma</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: Turma A - Manhã"
                required
              />
            </div>

            <div className="form-group">
              <label>Curso</label>
              <select
                name="cursoId"
                value={formData.cursoId}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um curso</option>
                {Array.isArray(cursos) && cursos.map(curso => (
                  <option key={curso._id} value={curso._id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>

            {!isInstrutor && (
              <div className="form-group">
                <label>Instrutor Responsável</label>
                <select
                  name="instrutorId"
                  value={formData.instrutorId}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione um instrutor</option>
                  {Array.isArray(instrutores) && instrutores.map(inst => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Data de Início</label>
                <input
                  type="date"
                  name="dataInicio"
                  value={formData.dataInicio}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Data de Término</label>
                <input
                  type="date"
                  name="dataFim"
                  value={formData.dataFim}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Horário</label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={handleInputChange}
                  placeholder="Ex: 08:00 - 12:00"
                />
              </div>
              <div className="form-group">
                <label>Capacidade</label>
                <input
                  type="number"
                  name="capacidade"
                  value={formData.capacidade}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ativa">Ativa</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {editingTurma ? "Salvar Alterações" : "Criar Turma"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
