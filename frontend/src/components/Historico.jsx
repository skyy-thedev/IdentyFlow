import { useEffect, useState } from "react";
import api from "../services/api";
import { useRole } from "./RoleGuard";
import { useAuth } from "../contexts/AuthContext";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "../styles/historicoComponent.css";

export default function Historico({ showToast }) {
  const { isInstrutor } = useRole();
  const { user } = useAuth();
  const isGod = user?.role === "god";
  
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [editingAluno, setEditingAluno] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const cursosDisponiveis = [...new Set(
  alunos.flatMap(a => Array.isArray(a.cursos) ? a.cursos : [a.cursos])
  )];


  // Busca os alunos cadastrados no servidor
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        // A rota /alunos já filtra automaticamente por role no backend
        const res = await api.get("/alunos");
        setAlunos(res.data.alunos || res.data);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        setErro("Não foi possível carregar o histórico de alunos.");
        if (showToast) showToast("Erro ao carregar histórico.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [showToast]);

  const alunosFiltrados = alunos.filter((aluno) => {
  const nomeMatch = aluno.nome
    .toLowerCase()
    .includes(filtroNome.toLowerCase());

  const dataMatch = filtroData
    ? new Date(aluno.dataCadastro).toISOString().split("T")[0] === filtroData
    : true;

  const cursoMatch = filtroCurso
    ? (Array.isArray(aluno.cursos)
        ? aluno.cursos.includes(filtroCurso)
        : aluno.cursos === filtroCurso)
    : true;

  return nomeMatch && dataMatch && cursoMatch;
  });

  // Função para excluir aluno (apenas GOD)
  const handleDeleteAluno = async (alunoId) => {
    try {
      await api.delete(`/alunos/${alunoId}`);
      setAlunos(alunos.filter(a => (a._id || a.id) !== alunoId));
      setShowDeleteModal(null);
      if (showToast) showToast("Aluno excluído com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      if (showToast) showToast("Erro ao excluir aluno.", "error");
    }
  };

  // Função para editar aluno (apenas GOD)
  const handleEditAluno = async (alunoId, dadosAtualizados) => {
    try {
      await api.put(`/alunos/${alunoId}`, dadosAtualizados);
      const res = await api.get("/alunos");
      setAlunos(res.data.alunos || res.data);
      setEditingAluno(null);
      if (showToast) showToast("Aluno atualizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao editar aluno:", error);
      if (showToast) showToast("Erro ao atualizar aluno.", "error");
    }
  };

  return (
    <div className="historico-page">
      <h1>📋 {isInstrutor ? "Meus Alunos" : "Histórico de Cadastros"}</h1>
      
      <div className="historico-container">

        <div className="filtro-container">
  <input
    type="text"
    placeholder="Pesquisar nome..."
    value={filtroNome}
    onChange={(e) => setFiltroNome(e.target.value)}
  />

 <input
  type="date"
  value={filtroData}
  onChange={(e) => setFiltroData(e.target.value)}
  onClick={(e) => e.target.showPicker && e.target.showPicker()}
/>

  <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
    <option value="">Todos os cursos</option>
    {cursosDisponiveis.map((c) => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
  </div>


        {loading ? (
          <p>Carregando dados...</p>
        ) : erro ? (
          <p className="erro">{erro}</p>
        ) : alunos.length === 0 ? (
          <p>Nenhum aluno cadastrado até o momento.</p>
        ) : (
          <div className="table-container">
            <table className="alunos-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Curso(s)</th>
                  <th>Data de Cadastro</th>
                  <th>Escolaridade</th>
                  {isGod && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id || aluno._id}>
                    <td data-label="Nome">{aluno.nome}</td>
                    <td data-label="Telefone">{aluno.telefone}</td>
                    <td data-label="Email">{aluno.email}</td>
                    <td data-label="Curso(s)">
                      {Array.isArray(aluno.cursos)
                        ? aluno.cursos.join(", ")
                        : aluno.cursos}
                    </td>
                    <td data-label="Data">
                      {aluno.dataCadastro
                        ? new Date(aluno.dataCadastro).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td data-label="Escolaridade">{aluno.escolaridade}</td>
                    {isGod && (
                      <td data-label="Ações" className="acoes-cell">
                        <button 
                          className="btn-edit" 
                          onClick={() => setEditingAluno(aluno)}
                          title="Editar"
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => setShowDeleteModal(aluno)}
                          title="Excluir"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o aluno <strong>{showDeleteModal.nome}</strong>?</p>
            <p className="warning-text">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(null)}>
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={() => handleDeleteAluno(showDeleteModal._id || showDeleteModal.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingAluno && (
        <div className="modal-overlay" onClick={() => setEditingAluno(null)}>
          <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
            <h3>✏️ Editar Aluno</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditAluno(editingAluno._id || editingAluno.id, {
                nome: formData.get("nome"),
                telefone: formData.get("telefone"),
                email: formData.get("email"),
                escolaridade: formData.get("escolaridade")
              });
            }}>
              <div className="form-group">
                <label>Nome</label>
                <input type="text" name="nome" defaultValue={editingAluno.nome} required />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" name="telefone" defaultValue={editingAluno.telefone} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" defaultValue={editingAluno.email} />
              </div>
              <div className="form-group">
                <label>Escolaridade</label>
                <input type="text" name="escolaridade" defaultValue={editingAluno.escolaridade} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingAluno(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
