import { useState } from "react";
import NavBar from '../components/NavBar.jsx';
import DashHeader from '../components/dashHeader.jsx';
import DashboardHome from "../components/DashboardHome";
import CadastroAlunos from "../components/CadastroAlunos";
import Historico from "../components/Historico";
import Analytics from "../components/Analytics";
import ListaUsuarios from "../components/ListaUsuarios";
import CursosLista from "../components/CursosLista";
import Turmas from "../components/Turmas.jsx";
import '../styles/dashboard.css';

function Dashboard({ showToast }) {
  const [currentSection, setCurrentSection] = useState("dashboard");

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardHome showToast={showToast} setActiveSection={setCurrentSection} />;
      case "cadastroAlunos":
      case "cadastro":
        return <CadastroAlunos showToast={showToast} />;
      case "alunos":
      case "historico":
        return <Historico showToast={showToast} />;
      case "turmas":
        return <Turmas showToast={showToast} />;
      case "analytics":
        return <Analytics showToast={showToast} />;
      case "cursos":
        return <CursosLista showToast={showToast} />;
      case "usuarios":
      case "users":
        return <ListaUsuarios showToast={showToast} />;
      default:
        return <DashboardHome showToast={showToast} setActiveSection={setCurrentSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      <NavBar onSelect={setCurrentSection} />

      <main className="landing">
        <DashHeader />

        <div className="exibeContent">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
