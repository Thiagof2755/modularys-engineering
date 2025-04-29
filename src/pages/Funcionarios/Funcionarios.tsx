import React from "react";
import { useNavigate } from "react-router-dom";
import { useFuncionarios } from "../../hooks/useFuncionarios";
import styles from "./Styles/Funcionarios.module.scss";

/**
 * Lista de funcionários com botões de navegação
 */
const Funcionarios: React.FC = () => {
    const { funcionarios } = useFuncionarios();
    const navigate = useNavigate();

    const handleVisualizar = (id: string) => {
        navigate(`/funcionarios/visualizar/${id}`);
    };

    const handleDemonstrativo = (id: string) => {
        navigate(`/funcionarios/demonstrativo/${id}`);
    };

    return (
        <div className={styles['funcionarios-container']}>
            <h1>Funcionários</h1>
            <table className={styles['funcionarios-table']}>
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
                    {funcionarios.map((func) => (
                        <tr key={func.id}>
                            <td data-label="Nome">{func.nome}</td>
                            <td data-label="CPF">{func.cpf}</td>
                            <td data-label="Cargo">{func.cargo}</td>
                            <td data-label="Departamento">{func.departamento}</td>
                            <td data-label="Status">{func.status}</td>
                            <td data-label="Ações">
                                <div className={styles.actions}>
                                    <button
                                        className={`${styles.btn} ${styles['btn--view']}`}
                                        onClick={() => handleVisualizar(func.id)}
                                    >
                                        Visualizar
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles['btn--demo']}`}
                                        onClick={() => handleDemonstrativo(func.id)}
                                    >
                                        Demonstrativo
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Funcionarios;
