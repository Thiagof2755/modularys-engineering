// src/types/orcamento.types.ts

export interface Cliente {
    codigo: string;
    nome: string;
    cnpj: string;
    telefone?: string;
    email: string;
}

export interface Orcamento {
    id?: string;
    numero?: string;
    data: string;
    cliente: Cliente;
    itens: Item[];
    valorTotal: number;
    observacoes?: string;
    status: OrcamentoStatus;
}

export interface Item {
    id: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
}

export type OrcamentoStatus = 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';