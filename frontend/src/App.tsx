import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import type { JSX } from "react/jsx-dev-runtime";

import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { CategoriesPage } from "./features/categories/pages/CategoriesPage";
import { AccountsPage } from "./features/accounts/pages/AccountsPage";
import { CardsPage } from "./features/cards/pages/CardsPage";

const Transactions = () => <h1 className="text-2xl font-bold">Lançamentos</h1>;
const Reports = () => <h1 className="text-2xl font-bold">Relatórios</h1>;

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { signed, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!signed) return <Navigate to="/auth" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          {/* Todas as rotas internas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />

            {/* Rotas de Cadastro */}
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="cards" element={<CardsPage />} />
          </Route>

          {/* Redirecionar qualquer rota desconhecida para o dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
