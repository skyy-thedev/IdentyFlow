import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import NavBar from '../components/NavBar.jsx';
import DashHeader from '../components/dashHeader.jsx';
import DashboardHome from "../components/DashboardHome";
import InstructorDashboard from "../components/InstructorDashboard";
import CadastroAlunos from "../components/CadastroAlunos";
import Historico from "../components/Historico";
import Analytics from "../components/Analytics";
import ListaUsuarios from "../components/ListaUsuarios";
import CursosLista from "../components/CursosLista";
import Turmas from "../components/Turmas.jsx";
import '../styles/dashboard.css';

function Dashboard({ showToast }) {
  const [currentSection, setCurrentSection] = useState("dashboard");
  const { user } = useAuth();
  
  // Verifica se o usuário é instrutor
  const isInstrutor = user?.role === "instrutor";

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        // Instrutor vê seu próprio dashboard
        if (isInstrutor) {
          return <InstructorDashboard showToast={showToast} />;
        }
        return <DashboardHome showToast={showToast} setActiveSection={setCurrentSection} />;
      case "cadastroAlunos":
      case "cadastro":
        // Instrutor não pode cadastrar alunos
        if (isInstrutor) {
          return <InstructorDashboard showToast={showToast} />;
        }
        return <CadastroAlunos showToast={showToast} />;
      case "alunos":
      case "historico":
        return <Historico showToast={showToast} />;
      case "turmas":
        return <Turmas showToast={showToast} />;
      case "analytics":
        // Instrutor não tem acesso a analytics completo
        if (isInstrutor) {
          return <InstructorDashboard showToast={showToast} />;
        }
        return <Analytics showToast={showToast} />;
      case "cursos":
        return <CursosLista showToast={showToast} />;
      case "usuarios":
      case "users":
        return <ListaUsuarios showToast={showToast} />;
      default:
        if (isInstrutor) {
          return <InstructorDashboard showToast={showToast} />;
        }
        return <DashboardHome showToast={showToast} setActiveSection={setCurrentSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      <NavBar onSelect={setCurrentSection} />

      <main className="landing">
        <DashHeader showToast={showToast} />

        <div className="exibeContent">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
