// src/pages/Funcionarios/DemonstrativoFuncionario.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFuncionarios, CustosFuncionario } from "../../hooks/useFuncionarios";
import styles from "./Styles/DemonstrativoFuncionario.module.scss";

/**
 * Tipagem para itens do gráfico de pizza
 */
type ItemGraficoPizza = {
    nome: string;
    valor: number;
    porcentagem: number;
};

const DemonstrativoFuncionario: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getCustosFuncionarioById } = useFuncionarios();
    const [custos, setCustos] = useState<CustosFuncionario | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (id) {
            const data = getCustosFuncionarioById(id);
            setCustos(data);
            setIsLoading(false);
        }
    }, [id, getCustosFuncionarioById]);

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

    const custoMensal = custos.custoTotal;
    const custoAnual = custoMensal * 12;

    const dadosBaseGraficoPizza = [
        { nome: "Salário Bruto", valor: custos.salarioBruto },
        { nome: "INSS Patronal", valor: custos.inssPatronal },
        { nome: "FGTS Total", valor: custos.fgtsMensal + custos.fgtsDecimoTerceiro + custos.fgtsFerias },
        { nome: "Provisões", valor: custos.provisaoDecimoTerceiro + custos.provisaoFerias }
    ];
    const totalMensal = dadosBaseGraficoPizza.reduce((acc, item) => acc + item.valor, 0);
    const dadosGraficoPizzaMensal: ItemGraficoPizza[] = dadosBaseGraficoPizza.map(item => ({
        ...item,
        porcentagem: parseFloat(((item.valor / totalMensal) * 100).toFixed(2))
    }));

    const dadosComparativoAnual = [
        { nome: "Mensal", valor: custoMensal },
        { nome: "Anual", valor: custoAnual }
    ];
    const valorMaximo = Math.max(...dadosComparativoAnual.map(item => item.valor));

    const demonstrativoItems = [
        { label: "Salário Base", valor: custos.salarioBruto },
        { label: "INSS Patronal", valor: custos.inssPatronal },
        { label: "FGTS Mensal", valor: custos.fgtsMensal },
        { label: "Provisão 13º", valor: custos.provisaoDecimoTerceiro },
        { label: "FGTS 13º", valor: custos.fgtsDecimoTerceiro },
        { label: "Provisão de Férias", valor: custos.provisaoFerias },
        { label: "FGTS Férias", valor: custos.fgtsFerias }
    ];

    const custoAnualPorCategoria = [
        { categoria: "Salário Bruto", valor: custos.salarioBruto * 12 },
        { categoria: "INSS Patronal", valor: custos.inssPatronal * 12 },
        { categoria: "FGTS", valor: (custos.fgtsMensal + custos.fgtsDecimoTerceiro + custos.fgtsFerias) * 12 },
        { categoria: "13º Salário", valor: custos.provisaoDecimoTerceiro * 12 },
        { categoria: "Férias", valor: custos.provisaoFerias * 12 }
    ];

    const custoMedioHora = (custoMensal / (8 * 22)).toFixed(2);
    const percentualEncargos = (((custoMensal - custos.salarioBruto) / custos.salarioBruto) * 100).toFixed(2);

    return (
        <div className={styles.demonstrativoContainer}>
            <header className={styles.demonstrativoHeader}>
                <h1 className={styles.demonstrativoTitle}>Demonstrativo de Custos</h1>
            </header>

            <div className={styles.resumoCards}>
                {[
                    { titulo: "Custo Mensal", valor: custoMensal },
                    { titulo: "Custo Anual", valor: custoAnual },
                    { titulo: "Custo por Hora", valor: parseFloat(custoMedioHora) },
                    { titulo: "% Encargos", valor: `${percentualEncargos}%` }
                ].map((item, idx) => (
                    <div className={styles.resumoCard} key={idx}>
                        <h3>{item.titulo}</h3>
                        <p className={styles.resumoValor}>
                            {typeof item.valor === "number" ? formatarMoeda(item.valor) : item.valor}
                        </p>
                    </div>
                ))}
            </div>

            <div className={styles.graficosContainer}>
                <div className={styles.graficoCard}>
                    <h3 className={styles.graficoTitulo}>Distribuição de Custos Mensais</h3>
                    <div className={styles.graficoPizza}>
                        {dadosGraficoPizzaMensal.map((segmento, index) => {
                            const inicio = dadosGraficoPizzaMensal
                                .slice(0, index)
                                .reduce((acc, item) => acc + (item.porcentagem * 3.6), 0);
                            const fim = inicio + (segmento.porcentagem * 3.6);
                            return (
                                <div key={index} className={styles.segmentoPizza} style={{
                                    '--angulo-inicio': `${inicio}deg`,
                                    '--angulo-fim': `${fim}deg`,
                                    '--cor': `hsl(${index * 90}, 70%, 50%)`
                                } as React.CSSProperties} />
                            );
                        })}
                        <div className={styles.centroPizza} />
                    </div>
                    <div className={styles.legendaGrafico}>
                        {dadosGraficoPizzaMensal.map((item, index) => (
                            <div key={index} className={styles.itemLegenda}>
                                <span className={styles.corLegenda} style={{ backgroundColor: `hsl(${index * 90}, 70%, 50%)` }} />
                                <span>{item.nome}: {formatarMoeda(item.valor)} ({item.porcentagem}%)</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.graficoCard}>
                    <h3 className={styles.graficoTitulo}>Comparativo Mensal x Anual</h3>
                    <div className={styles.graficoBarras}>
                        {dadosComparativoAnual.map((item, index) => {
                            const alturaPercentual = (item.valor / valorMaximo) * 100;
                            return (
                                <div key={index} className={styles.barraContainer}>
                                    <div
                                        className={styles.barra}
                                        style={{ height: `${alturaPercentual}%`, backgroundColor: index === 0 ? '#3498db' : '#2980b9' }}
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
                        <span className={styles.itemValue}>{formatarMoeda(totalMensal)}</span>
                    </div>
                </div>
            </div>

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
