export type TipoProduto = 'servico' | 'material';

export interface Cliente {
    codigo: string;
    nome: string;
    endereco: string;
    telefone: string;
    email: string;
    cnpj: string;
}

export interface Disponivel {
    codigo: string;
    descricao: string;
    valorPadrao: number;
}

export interface ServicoDisponivel extends Disponivel { }
export interface MaterialDisponivel extends Disponivel { }

export type ProdutoDisponivel = ServicoDisponivel | MaterialDisponivel;

export interface ProdutoAdicionado {
    id: number;
    tipo: TipoProduto;
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
}

export interface Totais {
    subtotal: number;
    desconto: number;
    total: number;
}
