// src/components/orcamento/ProdutosModal.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { ProdutoDisponivel, TipoProduto } from '../types/orcamento.types';
// Em um ambiente real, importar diretamente o JSON - aqui simulamos um fetch
import produtosData from '../data/produtos.json';

interface ProdutosModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipoProdutoSelecionado: TipoProduto;
    onSelectProduto: (produto: ProdutoDisponivel) => void;
}

const ProdutosModal: React.FC<ProdutosModalProps> = ({
    isOpen,
    onClose,
    tipoProdutoSelecionado,
    onSelectProduto,
}) => {
    const [filtroPesquisa, setFiltroPesquisa] = useState<string>('');
    const [produtosDisponiveis, setProdutosDisponiveis] = useState<ProdutoDisponivel[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);

    // Simula um fetch de dados
    useEffect(() => {
        // Em uma aplicação real, isto poderia ser um fetch para uma API
        const buscarProdutos = async () => {
            setCarregando(true);
            try {
                // Simula um delay de rede
                await new Promise(resolve => setTimeout(resolve, 300));

                // Escolhe os produtos baseado no tipo selecionado
                const produtos = tipoProdutoSelecionado === 'servico'
                    ? produtosData.servicos
                    : produtosData.materiais;

                setProdutosDisponiveis(produtos);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            } finally {
                setCarregando(false);
            }
        };

        if (isOpen) {
            buscarProdutos();
        }
    }, [isOpen, tipoProdutoSelecionado]);

    // Formatação de moeda
    const formatarMoeda = (valor: number): string => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Filtrar produtos baseado na pesquisa
    const produtosFiltrados = (): ProdutoDisponivel[] => {
        if (!filtroPesquisa) return produtosDisponiveis;
        return produtosDisponiveis.filter(p =>
            p.codigo.toLowerCase().includes(filtroPesquisa.toLowerCase()) ||
            p.descricao.toLowerCase().includes(filtroPesquisa.toLowerCase())
        );
    };

    // Handler para o input de pesquisa
    const handlePesquisaChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltroPesquisa(e.target.value);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        Selecionar {tipoProdutoSelecionado === 'servico' ? 'Serviço' : 'Material'}
                    </ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>

                <SearchInput
                    placeholder="Buscar por código ou descrição..."
                    value={filtroPesquisa}
                    onChange={handlePesquisaChange}
                />

                <TableWrapper>
                    {carregando ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText>Carregando produtos...</LoadingText>
                        </LoadingContainer>
                    ) : (
                        <Table>
                            <TableHead>
                                <tr>
                                    <TableHeadCell>Código</TableHeadCell>
                                    <TableHeadCell>Descrição</TableHeadCell>
                                    <TableHeadCell style={{ textAlign: 'right' }}>Valor Padrão</TableHeadCell>
                                </tr>
                            </TableHead>
                            <tbody>
                                {produtosFiltrados().length > 0 ? (
                                    produtosFiltrados().map(produto => (
                                        <SelectableRow
                                            key={produto.codigo}
                                            onClick={() => onSelectProduto(produto)}
                                        >
                                            <TableCell>{produto.codigo}</TableCell>
                                            <TableCell>{produto.descricao}</TableCell>
                                            <TableCell style={{ textAlign: 'right' }}>
                                                {formatarMoeda(produto.valorPadrao)}
                                            </TableCell>
                                        </SelectableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                                            Nenhum resultado encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </tbody>
                        </Table>
                    )}
                </TableWrapper>
            </ModalContent>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  color: #34495e;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0.3rem;
  line-height: 1;

  &:hover {
    color: #2c3e50;
  }
`;

const SearchInput = styled.input`
  padding: 0.7rem;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52,152,219,0.2);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
`;

const TableHead = styled.thead`
  background: #f8f9fa;
`;

const TableHeadCell = styled.th`
  padding: 1rem;
  text-align: left;
  color: #34495e;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #eceef0;
  white-space: nowrap;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8fafc;
  }
  &:hover {
    background: #f1f5f9;
  }
`;

const TableCell = styled.td`
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eceef0;
  font-size: 0.95rem;
  color: #2c3e50;
`;

const SelectableRow = styled(TableRow)`
  cursor: pointer;

  &:hover {
    background: #e1f0fa;
  }
`;

export default ProdutosModal;