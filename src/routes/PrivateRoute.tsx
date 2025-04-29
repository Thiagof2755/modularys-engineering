// src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
}

/**
 * Componente que protege as rotas privadas. Se o usuário não estiver autenticado,
 * redireciona para a página de login.
 *
 * @param children - Conteúdo protegido a ser renderizado se autenticado.
 * @returns JSX Element com conteúdo protegido ou redirecionamento para login.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
