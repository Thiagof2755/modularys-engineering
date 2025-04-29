import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../components/MainLayout";

// Lazy loading das páginas principais
const Login = lazy(() => import("../pages/Login"));
const Home = lazy(() => import("../pages/Home"));
const Orcamento = lazy(() => import("../pages/Orcamento/Orcamento"));
const FuncionariosRoutes = lazy(() => import("./FuncionariosRoutes"));

/**
 * Componente que define as rotas principais da aplicação.
 */
const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Carregando...</div>}>
                <Routes>
                    {/* Rota pública */}
                    <Route path="/login" element={<Login />} />

                    {/* Home sem layout lateral */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        }
                    />

                    {/* Páginas privadas com layout lateral */}
                    <Route
                        path="/orcamento"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Orcamento />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/funcionarios/*"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <FuncionariosRoutes />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* Qualquer outra rota vai pra home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;
