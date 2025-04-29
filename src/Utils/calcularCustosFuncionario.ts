type CustosFuncionario = {
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
 * Calcula os custos totais de um funcionário com base no salário bruto.
 *
 * @param salarioBruto - O salário bruto do funcionário.
 * @returns Um objeto contendo os custos detalhados e o custo total:
 * - `salarioBruto`: O salário bruto informado.
 * - `inssPatronal`: Valor do INSS patronal (20% do salário bruto).
 * - `fgtsMensal`: Valor do FGTS mensal (8% do salário bruto).
 * - `provisaoDecimoTerceiro`: Provisão para o 13º salário (8,33% do salário bruto).
 * - `fgtsDecimoTerceiro`: FGTS sobre a provisão do 13º salário (8% da provisão).
 * - `provisaoFerias`: Provisão para férias (11,11% do salário bruto).
 * - `fgtsFerias`: FGTS sobre a provisão de férias (8% da provisão).
 * - `custoTotal`: O custo total considerando todos os encargos e provisões.
 */
export function calcularCustosFuncionario(salarioBruto: number): CustosFuncionario {
    // Alíquotas
    const aliquotaINSSPatronal = 0.20; // 20%
    const aliquotaFGTS = 0.08; // 8%
    const aliquotaProvisao13 = 0.0833; // 1/12 ≈ 8,33%
    const aliquotaProvisaoFerias = 0.1111; // 8,33% + 2,78% ≈ 11,11%

    // Cálculos
    const inssPatronal = salarioBruto * aliquotaINSSPatronal;
    const fgtsMensal = salarioBruto * aliquotaFGTS;

    const provisaoDecimoTerceiro = salarioBruto * aliquotaProvisao13;
    const fgtsDecimoTerceiro = provisaoDecimoTerceiro * aliquotaFGTS;

    const provisaoFerias = salarioBruto * aliquotaProvisaoFerias;
    const fgtsFerias = provisaoFerias * aliquotaFGTS;

    const custoTotal =
        salarioBruto +
        inssPatronal +
        fgtsMensal +
        provisaoDecimoTerceiro +
        fgtsDecimoTerceiro +
        provisaoFerias +
        fgtsFerias;

    return {
        salarioBruto,
        inssPatronal,
        fgtsMensal,
        provisaoDecimoTerceiro,
        fgtsDecimoTerceiro,
        provisaoFerias,
        fgtsFerias,
        custoTotal,
    };
}






