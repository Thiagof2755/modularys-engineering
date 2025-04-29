import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import funcionariosData from '../../data/funcionarios.json';
import { calcularCustosFuncionario } from '../../Utils/calcularCustosFuncionario';
import styles from './Styles/DemonstrativoFuncionario.module.scss';

/**
 * Tipagem do retorno de custos por funcionário
 */
export type CustosFuncionario = {
    salarioBruto: number;
    inssPatronal: number;
    fgtsMensal: number;
    provisaoDecimoTerceiro: number;
    fgtsDecimoTerceiro: number;
    provisaoFerias: number;
    fgtsFerias: number;
    custoTotal: number;
};

/**
 * Tipagem para itens do gráfico de pizza
 */
type ItemGraficoPizza = {
    nome: string;
    valor: number;
    porcentagem: number;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const DemonstrativoFuncionario: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [custos, setCustos] = useState<CustosFuncionario | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        const funcionario = funcionariosData.find((f) => f.id === id);
        if (!funcionario) {
            setCustos(undefined);
            setIsLoading(false);
            return;
        }
        const data = calcularCustosFuncionario(funcionario.salarioBase);
        setCustos(data);
        setIsLoading(false);
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader} aria-label="Carregando..."></div>
                <p>Carregando dados...</p>
            </div>
        );
    }

    if (!custos) {
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Algo deu errado</h2>
                <p className={styles.errorMessage}>Funcionário não encontrado ou dados indisponíveis.</p>
            </div>
        );
    }

    const formatarMoeda = (valor: number): string =>
        valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Cálculos principais
    const custoMensal = custos.custoTotal;
    const custoAnual = custoMensal * 12;
    const custoMedioHora = (custoMensal / (8 * 22)).toFixed(2);
    const percentualEncargos = (((custoMensal - custos.salarioBruto) / custos.salarioBruto) * 100).toFixed(2);

    // Dados para gráfico de pizza
    const dadosBaseGraficoPizza = [
        { nome: 'Salário Bruto', valor: custos.salarioBruto },
        { nome: 'INSS Patronal', valor: custos.inssPatronal },
        { nome: 'FGTS Total', valor: custos.fgtsMensal + custos.fgtsDecimoTerceiro + custos.fgtsFerias },
        { nome: 'Provisões', valor: custos.provisaoDecimoTerceiro + custos.provisaoFerias }
    ];
    const totalPizza = dadosBaseGraficoPizza.reduce((acc, item) => acc + item.valor, 0);
    const dadosGraficoPizza = dadosBaseGraficoPizza.map(item => ({
        ...item,
        porcentagem: parseFloat(((item.valor / totalPizza) * 100).toFixed(2))
    }));

    // Dados para comparativo mensal x anual
    const dadosComparativoAnual = [
        { nome: 'Mensal', valor: custoMensal },
        { nome: 'Anual', valor: custoAnual }
    ];
    const valorMaximo = Math.max(...dadosComparativoAnual.map(item => item.valor));

    // Itens de detalhamento mensal
    const demonstrativoItems = [
        { label: 'Salário Base', valor: custos.salarioBruto },
        { label: 'INSS Patronal', valor: custos.inssPatronal },
        { label: 'FGTS Mensal', valor: custos.fgtsMensal },
        { label: 'Provisão 13º', valor: custos.provisaoDecimoTerceiro },
        { label: 'FGTS 13º', valor: custos.fgtsDecimoTerceiro },
        { label: 'Provisão de Férias', valor: custos.provisaoFerias },
        { label: 'FGTS Férias', valor: custos.fgtsFerias }
    ];

    // Análise anual por categoria
    const custoAnualPorCategoria = [
        { categoria: 'Salário Bruto', valor: custos.salarioBruto * 12 },
        { categoria: 'INSS Patronal', valor: custos.inssPatronal * 12 },
        { categoria: 'FGTS', valor: (custos.fgtsMensal + custos.fgtsDecimoTerceiro + custos.fgtsFerias) * 12 },
        { categoria: '13º Salário', valor: custos.provisaoDecimoTerceiro * 12 },
        { categoria: 'Férias', valor: custos.provisaoFerias * 12 }
    ];

    return (
        <div className={styles.demonstrativoContainer}>
            <header className={styles.demonstrativoHeader}>
                <h1 className={styles.demonstrativoTitle}>Demonstrativo de Custos</h1>
            </header>

            {/* Resumo rápido */}
            <div className={styles.resumoCards}>
                {[
                    { titulo: 'Custo Mensal', valor: custoMensal },
                    { titulo: 'Custo Anual', valor: custoAnual },
                    { titulo: 'Custo por Hora', valor: parseFloat(custoMedioHora) },
                    { titulo: '% Encargos', valor: `${percentualEncargos}%` }
                ].map((item, idx) => (
                    <div className={styles.resumoCard} key={idx}>
                        <h3>{item.titulo}</h3>
                        <p className={styles.resumoValor}>
                            {typeof item.valor === 'number' ? formatarMoeda(item.valor) : item.valor}
                        </p>
                    </div>
                ))}
            </div>

            {/* Gráficos */}
            <div className={styles.graficosContainer}>
                {/* Pizza */}
                <div className={styles.graficoCard}>
                    <h3 className={styles.graficoTitulo}>Distribuição de Custos Mensais</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dadosGraficoPizza}
                                dataKey="valor"
                                nameKey="nome"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(1)}%`}
                            >
                                {dadosGraficoPizza.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 20 }}>
                        <Legend verticalAlign="bottom" align="center" layout="horizontal" />
                    </div>
                </div>

                {/* Barras */}
                <div className={styles.graficoCard}>
                    <h3 className={styles.graficoTitulo}>Comparativo Mensal x Anual</h3>
                    <div className={styles.graficoBarras}>
                        {dadosComparativoAnual.map((item, index) => {
                            const alturaPercentual = (item.valor / valorMaximo) * 100;
                            return (
                                <div key={index} className={styles.barraContainer}>
                                    <div
                                        className={styles.barra}
                                        style={{
                                            height: `${alturaPercentual}%`,
                                            backgroundColor: index === 0 ? '#3498db' : '#2980b9'
                                        }}
                                    >
                                        <div className={styles.barraValor}>{formatarMoeda(item.valor)}</div>
                                    </div>
                                    <div className={styles.barraLabel}>{item.nome}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Detalhamento Mensal */}
            <div className={styles.demonstrativoCard}>
                <h3 className={styles.cardSubtitle}>Detalhamento Mensal</h3>
                <div className={styles.demonstrativoContent}>
                    {demonstrativoItems.map((item, index) => (
                        <div key={index} className={styles.demonstrativoItem}>
                            <span className={styles.itemLabel}>{item.label}:</span>
                            <span className={styles.itemValue}>{formatarMoeda(item.valor)}</span>
                        </div>
                    ))}
                    <div className={`${styles.demonstrativoItem} ${styles.totalItem}`}>
                        <span className={styles.itemLabel}>Total:</span>
                        <span className={styles.itemValue}>{formatarMoeda(totalPizza)}</span>
                    </div>
                </div>
            </div>

            {/* Análise Anual */}
            <div className={styles.demonstrativoCard}>
                <h3 className={styles.cardSubtitle}>Análise Anual por Categoria</h3>
                <div className={styles.demonstrativoContent}>
                    {custoAnualPorCategoria.map((item, index) => (
                        <div key={index} className={styles.demonstrativoItem}>
                            <span className={styles.itemLabel}>{item.categoria}:</span>
                            <span className={styles.itemValue}>{formatarMoeda(item.valor)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DemonstrativoFuncionario;