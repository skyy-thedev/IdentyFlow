import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/CadastroAlunos.css";

export default function CadastroAlunos() {
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

  useEffect(() => {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split("T")[0]; // yyyy-mm-dd
    setFormData((prev) => ({
      ...prev,
      dataCadastro: dataFormatada,
    }));
  }, []);

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
      alert("Aluno cadastrado com sucesso!");

      setFormData({
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
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar aluno");
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>CADASTRO</h1>

        <form className="form" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="full-width">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          {/* Dados pessoais */}
          <div className="grid grid-3">
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

            <div>
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="rg">RG</label>
              <input
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-3">
            <div>
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>

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
              <label htmlFor="dataCadastro">Data de Cadastro</label>
              <input
                id="dataCadastro"
                type="date"
                name="dataCadastro"
                value={formData.dataCadastro}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="full-width">
            <label htmlFor="endereco">Endereço</label>
            <input
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          {/* Escolaridade */}
          <div className="full-width">
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

          {/* Cursos */}
          <div className="form-group">
            <label>Curso Escolhido</label>
            <div className="checkbox-grid">
              {[
                "Manicure e Pedicure",
                "Spa dos Pés",
                "Cabeleireira Profissional",
                "Alongamento em Unhas",
                "Trancista Profissional",
                "Design em Sobrancelhas",
                "Maquiagem Profissional",
              ].map((curso) => (
                <label key={curso} className="checkbox">
                  <input
                    type="checkbox"
                    checked={formData.cursos.includes(curso)}
                    onChange={() => handleCheckboxChange(curso)}
                  />
                  {curso}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="cadastro-btn">Cadastrar Aluno</button>
        </form>
      </div>
    </div>
  );
}
