
import { useEffect, useState } from "react";
import api from "../services/api";
import AddCurso from "./AddCurso";
import Modal from "./Modal";
import "../styles/Cursos.css";


export default function CursosLista({ showToast }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [showAddCurso, setShowAddCurso] = useState(false);
  const [cursoParaExcluir, setCursoParaExcluir] = useState(null); // Guarda o curso a ser excluído
  const [cursoParaEditar, setCursoParaEditar] = useState(null); // Guarda o curso a ser editado
  const [editForm, setEditForm] = useState({});
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await api.get("/cursos");
        setCursos(res.data.cursos || []);
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar os cursos.");
        showToast("Erro ao carregar cursos.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [showToast]);

  if (loading) return <p className="loading">Carregando cursos...</p>;
  if (erro) return <p className="erro">{erro}</p>;

  // Função para confirmar exclusão
  const confirmarExclusao = async () => {
    if (!cursoParaExcluir) return;
    try {
      await api.delete(`/cursos/${cursoParaExcluir._id}`);
      setCursos((prev) => prev.filter((c) => c._id !== cursoParaExcluir._id));
      showToast("Curso excluído com sucesso!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.msg || "Erro ao excluir curso.",
        "error"
      );
    } finally {
      setCursoParaExcluir(null);
    }
  };

  // Cursos filtrados pelo nome
  const cursosFiltrados = cursos.filter((curso) =>
    curso.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  return (
    <div className="cursos-container">
      <h2>Cursos Cadastrados</h2>
      <p>Total: <strong>{cursosFiltrados.length}</strong></p>

      <div className="filtro-curso-container">
        <button className="btn-add-curso" onClick={() => setShowAddCurso(true)}>
          + Adicionar Novo Curso
        </button>
        <input
          className="input-filtro-curso"
          type="text"
          placeholder="Pesquisar curso..."
          value={filtroNome}
          onChange={e => setFiltroNome(e.target.value)}
        />
      </div>

      {showAddCurso && (
        <Modal
          type="info"
          title="Adicionar Novo Curso"
          message={null}
          onClose={() => setShowAddCurso(false)}
        >
          <AddCurso
            onCursoAdded={async () => {
              try {
                const res = await api.get("/cursos");
                setCursos(res.data.cursos || []);
                setShowAddCurso(false);
                showToast("Curso criado com sucesso!", "success");
              } catch (err) {
                console.error(err);
                showToast("Erro ao carregar cursos.", "error");
              }
            }}
            onClose={() => setShowAddCurso(false)}
          />
        </Modal>
      )}

      <div className="table-wrapper">
        <table className="cursos-table">

        <thead>
          <tr>
            <th>Curso</th>
            <th>Carga Horária</th>
            <th>Dias</th>
            <th>Valor (R$)</th>
            <th>Mín. Vagas</th>
            <th>Máx. Vagas</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
            {cursosFiltrados.length === 0 ? (
             <tr>
            <td colSpan={7} style={{ textAlign: "center", padding: "40px 0" }}>
            Nenhum curso encontrado
            </td>
          </tr>
         ) : (
         cursosFiltrados.map((c) => (

            <tr key={c._id}>
              <td>{c.nome}</td>
              <td>{c.cargaHoraria}h</td>
              <td>{c.dias}</td>
              <td>{Number(c.valorTotal).toFixed(2)}</td>
              <td>{c.minVagas}</td>
              <td>{c.maxVagas}</td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => {
                    setCursoParaEditar(c);
                    setEditForm({
                      nome: c.nome,
                      cargaHoraria: c.cargaHoraria,
                      dias: c.dias,
                      valorTotal: c.valorTotal,
                      minVagas: c.minVagas,
                      maxVagas: c.maxVagas,
                    });
                  }}
                >
                  Editar
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setCursoParaExcluir(c)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))
        )}
        </tbody>
        </table>
      </div>

      {/* Modal de confirmação de exclusão */}
      {cursoParaExcluir && (
        <Modal
          type="warning"
          title="Confirmar exclusão"
          message={`Tem certeza que deseja excluir o curso "${cursoParaExcluir.nome}"? Essa ação pode ser desfeita reativando o curso futuramente.`}
          onClose={() => setCursoParaExcluir(null)}
        >
          <button
            className="btn-delete"
            onClick={confirmarExclusao}
            style={{ marginRight: 12 }}
          >
            Excluir
          </button>
          <button
            className="btn-edit"
            onClick={() => setCursoParaExcluir(null)}
          >
            Cancelar
          </button>
        </Modal>
      )}

      {/* Modal de edição de curso */}
      {cursoParaEditar && (
        <Modal
          type="info"
          title="Editar Curso"
          message={null}
          onClose={() => setCursoParaEditar(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.put(`/cursos/${cursoParaEditar._id}`, {
                  nome: editForm.nome,
                  cargaHoraria: Number(editForm.cargaHoraria),
                  dias: Number(editForm.dias),
                  valorTotal: Number(editForm.valorTotal),
                  minVagas: Number(editForm.minVagas),
                  maxVagas: Number(editForm.maxVagas),
                });
                setCursos((prev) => prev.map((c) =>
                  c._id === cursoParaEditar._id
                    ? { ...c, ...editForm }
                    : c
                ));
                showToast("Curso atualizado com sucesso!", "success");
                setCursoParaEditar(null);
              } catch (err) {
                showToast(
                  err.response?.data?.msg || "Erro ao atualizar curso.",
                  "error"
                );
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <label>
              Nome:
              <input
                type="text"
                value={editForm.nome || ""}
                onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </label>
            <label>
              Carga Horária:
              <input
                type="number"
                value={editForm.cargaHoraria || ""}
                onChange={e => setEditForm(f => ({ ...f, cargaHoraria: e.target.value }))}
                required
              />
            </label>
            <label>
              Dias:
              <input
                type="number"
                value={editForm.dias || ""}
                onChange={e => setEditForm(f => ({ ...f, dias: e.target.value }))}
                required
              />
            </label>
            <label>
              Valor Total:
              <input
                type="number"
                value={editForm.valorTotal || ""}
                onChange={e => setEditForm(f => ({ ...f, valorTotal: e.target.value }))}
                required
              />
            </label>
            <label>
              Mínimo de Vagas:
              <input
                type="number"
                value={editForm.minVagas || ""}
                onChange={e => setEditForm(f => ({ ...f, minVagas: e.target.value }))}
                required
              />
            </label>
            <label>
              Máximo de Vagas:
              <input
                type="number"
                value={editForm.maxVagas || ""}
                onChange={e => setEditForm(f => ({ ...f, maxVagas: e.target.value }))}
                required
              />
            </label>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" className="btn-save-curso">Salvar</button>
              <button type="button" className="btn-edit" onClick={() => setCursoParaEditar(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
