import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFuncionarios, Funcionario } from "../../hooks/useFuncionarios";
import styles from "./Styles/VisualizarFuncionario.module.scss";

/**
 * Componente para visualizar os dados completos de um funcionário.
 *
 * Obtém o id do funcionário via parâmetros da rota e exibe todas as informações disponíveis.
 *
 * @returns JSX Element com os detalhes do funcionário ou mensagem de erro se não encontrado.
 */
const VisualizarFuncionario: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getFuncionarioById } = useFuncionarios();
    const [funcionario, setFuncionario] = useState<Funcionario | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            setLoading(true);
            // Simulando carregamento para melhor experiência do usuário
            setTimeout(() => {
                const data = getFuncionarioById(id);
                setFuncionario(data);
                setLoading(false);
            }, 3);
        }
    }, [id, getFuncionarioById]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorContainer}>
                        <h2 className={styles.errorTitle}>Carregando informações...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (!funcionario) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorContainer}>
                        <h2 className={styles.errorTitle}>Funcionário não encontrado</h2>
                        <p className={styles.errorMessage}>O funcionário que você está procurando não existe ou foi removido.</p>
                        <button
                            className={styles.backButton}
                            onClick={() => navigate("/funcionarios")}
                        >
                            Voltar à Lista de Funcionários
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadgeClass = () => {
        return funcionario.status === 'Ativo'
            ? `${styles.statusBadge} ${styles.active}`
            : `${styles.statusBadge} ${styles.inactive}`;
    };

    // Formatar data para exibição
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    // Formatar valor monetário para exibição
    const formatCurrency = (value: string | number) => {
        if (!value) return "-";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(value));
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Detalhes do Funcionário</h1>
                    <p className={styles.subtitle}>Visualização completa dos dados cadastrais</p>
                </div>

                <div className={styles.content}>
                    <div className={styles.dataGroup}>
                        <h2 className={styles.sectionTitle}>Informações Pessoais</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Nome Completo</span>
                                <span className={`${styles.value} ${styles.highlight}`}>{funcionario.nome}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>CPF</span>
                                <span className={styles.value}>{funcionario.cpf}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Data de Nascimento</span>
                                <span className={styles.value}>{formatDate(funcionario.dataNascimento)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Sexo</span>
                                <span className={styles.value}>{funcionario.sexo}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Estado Civil</span>
                                <span className={styles.value}>{funcionario.estadoCivil}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Escolaridade</span>
                                <span className={styles.value}>{funcionario.escolaridade}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.dataGroup}>
                        <h2 className={styles.sectionTitle}>Contato</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Email</span>
                                <span className={styles.value}>{funcionario.email}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Telefone</span>
                                <span className={styles.value}>{funcionario.telefone}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.dataGroup}>
                        <h2 className={styles.sectionTitle}>Dados Profissionais</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Matrícula</span>
                                <span className={styles.value}>{funcionario.matricula}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Cargo</span>
                                <span className={styles.value}>{funcionario.cargo}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Departamento</span>
                                <span className={styles.value}>{funcionario.departamento}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Data de Admissão</span>
                                <span className={styles.value}>{formatDate(funcionario.dataAdmissao)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Tipo de Contrato</span>
                                <span className={styles.value}>{funcionario.tipoContrato}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Turno</span>
                                <span className={styles.value}>{funcionario.turno}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Salário Base</span>
                                <span className={styles.value}>{formatCurrency(funcionario.salarioBase)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>Status</span>
                                <span className={getStatusBadgeClass()}>{funcionario.status}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.label}>ID do Sistema</span>
                                <span className={styles.value}>{funcionario.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.backButton}
                            onClick={() => navigate("/funcionarios")}
                        >
                            Voltar à Lista
                        </button>

                        <button
                            className={styles.secondaryButton}
                            onClick={() => navigate(`/funcionarios/editar/${id}`)}
                        >
                            Editar Funcionário
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualizarFuncionario;