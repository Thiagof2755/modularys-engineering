// src/pages/Funcionarios/Funcionarios.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useFuncionarios } from "../../hooks/useFuncionarios";

/**
 * Lista de funcionários com botões de navegação
 */
const Funcionarios: React.FC = () => {
    const { funcionarios } = useFuncionarios();
    const navigate = useNavigate();

    const handleVisualizar = (id: string) => {
        // rota absoluta para /funcionarios/visualizar/:id
        navigate(`/funcionarios/visualizar/${id}`);
    };

    const handleDemonstrativo = (id: string) => {
        navigate(`/funcionarios/demonstrativo/${id}`);
    };

    return (
        <div>
            <h1>Funcionários</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {funcionarios.map((funcionario) => (
                        <tr key={funcionario.id}>
                            <td>{funcionario.nome}</td>
                            <td>{funcionario.cpf}</td>
                            <td>{funcionario.cargo}</td>
                            <td>{funcionario.departamento}</td>
                            <td>{funcionario.status}</td>
                            <td>
                                <button
                                    onClick={() => handleVisualizar(funcionario.id)}
                                >
                                    Visualizar
                                </button>
                                <button
                                    onClick={() => handleDemonstrativo(funcionario.id)}
                                >
                                    Demonstrativo
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Funcionarios;
