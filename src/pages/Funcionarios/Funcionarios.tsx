import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFuncionarios } from "../../hooks/useFuncionarios";
import styles from "./Styles/Funcionarios.module.scss";

const Funcionarios: React.FC = () => {
    const { funcionarios } = useFuncionarios();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filtro de busca
    const filteredFuncionarios = funcionarios.filter((func) =>
        func.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.cpf.includes(searchTerm) ||
        func.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFuncionarios = filteredFuncionarios.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reinicia a página ao buscar
    };

    const changePage = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleVisualizar = (id: string) => {
        navigate(`/funcionarios/visualizar/${id}`);
    };

    const handleDemonstrativo = (id: string) => {
        navigate(`/funcionarios/demonstrativo/${id}`);
    };

    return (
        <div className={styles['funcionarios-container']}>
            <h1>Funcionários</h1>

            {/* Campo de busca */}
            <input
                type="text"
                placeholder="Buscar por nome, CPF, cargo ou departamento"
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles['search-input']}
            />

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
                    {currentFuncionarios.length > 0 ? (
                        currentFuncionarios.map((func) => (
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>Nenhum funcionário encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
};

export default Funcionarios;
