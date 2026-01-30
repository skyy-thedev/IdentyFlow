import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  // Carrega o user salvo no localStorage ao iniciar a aplicação
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // LOGIN REAL — dados vindos do backend (já no LoginForm)
  // Agora salva todos os campos incluindo foto, email, telefone
  const login = (userData, token) => {
    const newUser = {
      id: userData.id,
      nome: userData.nome,
      email: userData.email || "",
      telefone: userData.telefone || "",
      foto: userData.foto || "",
      role: userData.role,
      token: token
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  // Atualizar dados do usuário (sem alterar o token)
  const updateUser = (updatedData) => {
    const newUser = {
      ...user,
      ...updatedData
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Agora recebe um ARRAY corrigido
  const hasAccess = (rolesAllowed) => {
    if (!user) return false;

    // god tem acesso total
    if (user.role === "god") return true;

    return rolesAllowed.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}