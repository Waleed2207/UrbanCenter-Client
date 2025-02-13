import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux"; // ✅ Import Redux Provider
import store from "./store/index"; // ✅ Import Redux store

import Dashboard from "./pages/Dashboard/Dashboard";
import SignIn from "./pages/SignIn/SignIn";
import ReportTable from "./components/ReportTable/ReportTable";
// import Settings from "./components/Settings/index";
import ResolvedCommentsReport from "./components/ResolvedCommentsReport/ResolvedCommentsReport"
import ReportPage from "./pages/ReportPage/ReportPage";
import AuthContext from "./contexts/AuthContext";
import UserContext from "./contexts/UserContext";
const App = () => {
  const { isAuthenticated, user,setUser, handleLogout, handleSignIn } = useContext(AuthContext);

  return (
    <Provider store={store}> 
      <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/reports" replace /> : <SignIn onSignInSuccess={handleSignIn} />
          }
        />

        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout}>
                <ReportTable />
              </Dashboard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/reports/api"
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout}>
                <ReportPage />
              </Dashboard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/reports/api/v1"
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout}>
                <ResolvedCommentsReport />
              </Dashboard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      </UserContext.Provider>
    </Provider>
  );
};

export default App;
