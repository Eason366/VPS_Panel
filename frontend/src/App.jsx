import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedLayout from "./components/ProtectedLayout";
import TerminalPage from "./pages/Terminal";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* 重定向 "/"：如果已登录跳转 dashboard，否则 login */}
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        
        {/* 登录页 */}
        <Route path="/login" element={<Login />} />

        {/* 受保护页面 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/terminal"
          element={
            <ProtectedLayout>
              <TerminalPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedLayout>
              <Files />
            </ProtectedLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
