import { useState, useEffect } from "react";
import api from "../services/api";
import axios from "axios";
import "../styles/CadastroAlunos.css";


export default function CadastroAlunos({ showToast }) {
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    cpf: "",
    rg: "",
    telefone: "",
    email: "",
    dataCadastro: "",
    endereco: "",
    escolaridade: "",
    cursos: [],
  });

  const [documento, setDocumento] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursos, setCursos] = useState("");

  useEffect(() => {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      dataCadastro: dataFormatada,
    }));
  }, []);

  /** --- Funções de identificação e máscara CPF/RG --- */
  function identificarDocumento(valor) {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length === 11) return "cpf";
    if (apenasNumeros.length === 9) return "rg";
    return null;
  }

  function aplicarMascaraDocumento(valor) {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 9) {
      // RG
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,1})$/, ".$1-$2")
        .slice(0, 12);
    } else {
      // CPF
      return apenasNumeros
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2")
        .slice(0, 14);
    }
  }

  function handleDocumentoChange(e) {
    let valor = e.target.value;
    valor = aplicarMascaraDocumento(valor);
    setDocumento(valor);

    const tipo = identificarDocumento(valor);
    setFormData((prev) => ({
      ...prev,
      cpf: tipo === "cpf" ? valor : "",
      rg: tipo === "rg" ? valor : "",
    }));
  }

  /** --- Função de máscara de telefone --- */
  function aplicarMascaraTelefone(valor) {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`;
    }
    if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  }

  function handleTelefoneChange(e) {
    const valor = aplicarMascaraTelefone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      telefone: valor,
    }));
  }

  /** --- Funções auxiliares --- */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCheckboxChange(curso) {
    setFormData((prev) => ({
      ...prev,
      cursos: prev.cursos.includes(curso)
        ? prev.cursos.filter((c) => c !== curso)
        : [...prev.cursos, curso],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/alunos", formData);
      showToast("Aluno cadastrado com sucesso!");

      const hoje = new Date();
      const dataFormatada = hoje.toISOString().split("T")[0];

      setFormData({
        nome: "",
        dataNascimento: "",
        cpf: "",
        rg: "",
        telefone: "",
        email: "",
        dataCadastro: dataFormatada,
        endereco: "",
        escolaridade: "",
        cursos: [],
      });
      setDocumento("");
      console.log(formData);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar aluno");
    }
  }

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/cursos", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCursos(res.data.cursos);
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


  return (
    <div className="page">
      <div className="card">
        <h1>CADASTRO DE NOVO ALUNO</h1>

        <form className="form" onSubmit={handleSubmit}>
          {/* 1ª linha - Nome, Telefone e Data de Nascimento */}
          <div className="grid grid-3">
            <div>
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                placeholder="Digite o nome completo"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="(XX) XXXXX-XXXX"
                maxLength="15"
              />
            </div>

            <div>
              <label htmlFor="dataNascimento">Data de Nascimento</label>
              <input
                id="dataNascimento"
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 2ª linha - E-mail, CPF/RG e Data de Cadastro */}
          <div className="grid grid-3">
            <div>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="documento">CPF ou RG</label>
              <input
                id="documento"
                name="documento"
                value={documento}
                onChange={handleDocumentoChange}
                placeholder="Digite o CPF ou RG"
                maxLength="14"
              />
            </div>

            <div>
              <label htmlFor="dataCadastro">Data de Cadastro</label>
              <input
                id="dataCadastro"
                type="date"
                name="dataCadastro"
                value={formData.dataCadastro}
                disabled
              />
            </div>
          </div>

          {/* 3ª linha - Endereço e Escolaridade */}
          <div className="grid grid-2">
            <div>
              <label htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="escolaridade">Grau de Escolaridade</label>
              <select
                id="escolaridade"
                name="escolaridade"
                value={formData.escolaridade}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                <option>Ensino Fundamental</option>
                <option>Ensino Médio</option>
                <option>Ensino Superior</option>
              </select>
            </div>
          </div>

          {/* 4ª linha - Cursos */}
          <div className="form-group">
            <p>Curso(s) Escolhido(s):</p>
          <div className="checkbox-grid">
            {loading ? (
              <p>Carregando cursos...</p>
            ) : erro ? (
              <p className="erro">{erro}</p>
            ) : cursos.length > 0 ? (
              cursos.map((curso) => {
                const nomeCurso = curso.nome || curso;
                return (
                  <label key={nomeCurso} className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox-round"
                      checked={formData.cursos.includes(nomeCurso)}
                      onChange={() => handleCheckboxChange(nomeCurso)}
                    />
                    <p>{nomeCurso}</p>
                  </label>
                );
              })
            ) : (
              <p>Nenhum curso disponível.</p>
            )}
          </div>
        </div>

          <button type="submit" className="cadastro-btn">
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </div>
  );
}
