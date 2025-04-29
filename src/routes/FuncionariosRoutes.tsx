// src/routes/FuncionariosRoutes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy loading dos componentes de funcionários
const Funcionarios = lazy(() => import("../pages/Funcionarios/Funcionarios"));
const VisualizarFuncionario = lazy(
    () => import("../pages/Funcionarios/VisualizarFuncionario")
);
const DemonstrativoFuncionario = lazy(
    () => import("../pages/Funcionarios/DemonstrativoFuncionario")
);

/**
 * Rotas internas de /funcionarios
 */
const FuncionariosRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Carregando funcionários...</div>}>
            <Routes>
                {/* Lista */}
                <Route path="/" element={<Funcionarios />} />
                {/* Demonstrativo de custos */}
                <Route
                    path="demonstrativo/:id"
                    element={<DemonstrativoFuncionario />}
                />

                {/* Visualizar um funcionário */}
                <Route
                    path="visualizar/:id"
                    element={<VisualizarFuncionario />}
                />


                {/* Rota inválida dentro de /funcionarios */}
                <Route
                    path="*"
                    element={<Navigate to="/funcionarios" replace />}
                />
            </Routes>
        </Suspense>
    );
};

export default FuncionariosRoutes;
