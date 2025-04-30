import { useState, useEffect } from "react";
import funcionariosData from "../data/funcionarios.json";
import { calcularCustosFuncionario } from "../Utils/calcularCustosFuncionario";

/**
 * Representa um funcionário com todas as informações.
 */
export type Funcionario = {
    id: string;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    dataNascimento: string;
    dataAdmissao: string;
    matricula: string;
    cargo: string;
    departamento: string;
    salarioBase: number;
    status: string;
    tipoContrato: string;
    sexo: string;
    estadoCivil: string;
    escolaridade: string;
    turno: string;
};

/**
 * Representa os dados básicos de um funcionário.
 */
export type FuncionarioBasico = Pick<
    Funcionario,
    "id" | "nome" | "cpf" | "cargo" | "departamento" | "status"
>;

/**
 * Representa os custos detalhados de um funcionário, calculados a partir do salário bruto.
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
 * Hook para gerenciamento de funcionários.
 *
 * Fornece:
 * - Uma lista de funcionários com dados básicos.
 * - Uma função para retornar os dados completos de um funcionário por ID.
 * - Uma função para calcular e retornar os custos detalhados de um funcionário, utilizando o salário base.
 *
 * @returns Objeto contendo:
 *   - `funcionarios`: Array de funcionários com dados básicos.
 *   - `getFuncionarioById`: Função que recebe um ID e retorna o funcionário completo (ou undefined).
 *   - `getCustosFuncionarioById`: Função que recebe um ID e retorna os custos detalhados do funcionário (ou undefined).
 */
export function useFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

    useEffect(() => {
        // Carrega todos os dados dos funcionários a partir do arquivo JSON
        setFuncionarios(funcionariosData);
    }, []);

    /**
     * Obtém uma lista de funcionários com dados básicos.
     *
     * @returns Array de objetos contendo id, nome, cpf, cargo, departamento e status.
     */
    function getFuncionariosBasico(): FuncionarioBasico[] {
        return funcionarios.map((func) => ({
            id: func.id,
            nome: func.nome,
            cpf: func.cpf,
            cargo: func.cargo,
            departamento: func.departamento,
            status: func.status,
        }));
    }

    /**
     * Retorna os dados completos de um funcionário a partir de seu ID.
     *
     * @param id - Identificador único do funcionário.
     * @returns O objeto completo do funcionário ou `undefined` se não for encontrado.
     */
    function getFuncionarioById(id: string): Funcionario | undefined {
        return funcionarios.find((func) => func.id === id);
    }

    /**
     * Calcula e retorna a média salarial de funcionários com base no cargo.
     *     
     * @param cargo - Cargo do funcionário.
     * @returns A média salarial dos funcionários com o cargo especificado.
     */
    function getMediaSalarioPorCargo(cargo: string): number {
        const funcionariosDoCargo = funcionarios.filter((func) => func.cargo === cargo);
        const totalSalario = funcionariosDoCargo.reduce((total, func) => total + func.salarioBase, 0);
        return funcionariosDoCargo.length > 0 ? totalSalario / funcionariosDoCargo.length : 0;
    }

    /**
     * Calcula e retorna os custos detalhados de um funcionário com base no seu salário base.
     * Utiliza a função utilitária `calcularCustosFuncionario`.
     *
     * @param id - Identificador único do funcionário.
     * @returns O objeto com os custos do funcionário ou `undefined` se o funcionário não for encontrado.
     */
    function getCustosFuncionarioById(id: string): CustosFuncionario | undefined {
        const funcionario = getFuncionarioById(id);
        if (!funcionario) return undefined;

        return calcularCustosFuncionario(funcionario.salarioBase);
    }

    return {
        funcionarios: getFuncionariosBasico(),
        getFuncionarioById,
        getCustosFuncionarioById,
        getMediaSalarioPorCargo,
    };

    /* */
}
