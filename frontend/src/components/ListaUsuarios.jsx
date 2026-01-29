import { useEffect, useState } from "react";
import api from "../services/api";
import AddUser from "./AddUser";
import "../styles/ListaUsuarios.css";

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [showAdd, setShowAdd] = useState(false);

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users");
      setUsuarios(response.data.users || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setErro("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="loading">Carregando usuários...</p>;
  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div className="lista-container">
      
      <h2>Lista de Usuários</h2>
      <p>Total: <strong>{usuarios.length}</strong></p>

      {/* BOTÃO ADICIONAR */}
      <button className="btn-add" onClick={() => setShowAdd(true)}>
        + Adicionar Usuário
      </button>

      {/* FORM ADD USER */}
      {showAdd && (
        <AddUser
          onClose={() => setShowAdd(false)}
          onUserAdded={() => {
            fetchUsers();
            setShowAdd(false);
          }}
        />
      )}


      {/* TABELA */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Função</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u._id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td className={`role ${u.role}`}>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
