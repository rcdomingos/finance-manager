import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { CategoriesPage } from "./features/categories/pages/CategoriesPage";
import { AccountsPage } from "./features/accounts/pages/AccountsPage";

const Transactions = () => <h1 className="text-2xl font-bold">Lançamentos</h1>;
const Reports = () => <h1 className="text-2xl font-bold">Relatórios</h1>;
const Cards = () => <h1 className="text-2xl font-bold">Meus Cartões</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Raiz com Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />

          {/* Rotas de Cadastro */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="cards" element={<Cards />} />
        </Route>

        {/* Redirecionar qualquer rota desconhecida para o dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
