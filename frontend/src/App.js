import Inicio from './pages/home.jsx';
import Dashboard from './pages/dashboard.jsx';
import Planos from './pages/Planos.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { SubscriptionProvider } from "./contexts/SubscriptionContext.jsx";
import { Router, Route, Switch } from "wouter";
import { useState } from "react";
import Toast from "./components/Toast";

function App() {

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <Switch>

            <Route path="/" component={Inicio} />

            <Route path="/planos">
              <ProtectedRoute roles={["admin", "instrutor", "god"]}>
                <Planos showToast={showToast} />
              </ProtectedRoute>
            </Route>

            <Route path="/dashboard">
              <ProtectedRoute roles={["admin", "instrutor", "god"]}>
                <Dashboard showToast={showToast} />

                {toast && (
                  <Toast
                    message={toast.message}
                    type={toast.type}
                  />
                )}
              </ProtectedRoute>
            </Route>

          </Switch>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
