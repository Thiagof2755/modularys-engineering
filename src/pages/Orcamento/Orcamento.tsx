// src/components/orcamento/Orcamento.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Cliente,
  ProdutoDisponivel,
  ProdutoAdicionado,
  TipoProduto,
  Totais,
} from '../../types/orcamento.types';
import ProdutosModal from '../../components/ProdutosModal';
import EstatisticaModal from '../../components/EstatisticaModal';

const Orcamento: React.FC = () => {
  const navigate = useNavigate();

  // Estado do cliente
  const [cliente, setCliente] = useState<Cliente>({
    codigo: '',
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    cnpj: '',
  });

  // Outros estados
  const [tipoProdutoSelecionado, setTipoProdutoSelecionado] = useState<TipoProduto>('servico');
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDisponivel | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [valorUnitario, setValorUnitario] = useState<number | ''>('');
  const [produtos, setProdutos] = useState<ProdutoAdicionado[]>([]);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [totais, setTotais] = useState<Totais>({ subtotal: 0, desconto: 0, total: 0 });
  const [visualizarModalAberto, setVisualizarModalAberto] = useState<boolean>(false);
  const [estatisticaModalAberto, setEstatisticaModalAberto] = useState<boolean>(false);

  // Formatação de moeda melhorada
  const formatarMoeda = (valor: number | ''): string => {
    if (valor === '') return '';
    return (valor as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Conversão melhorada para números
  const converterParaNumero = (valorFormatado: string): number => {
    // Remove tudo exceto dígitos, vírgula e ponto
    const valorLimpo = valorFormatado.replace(/[^\d,\.]/g, '');
    // Converte vírgula para ponto para garantir interpretação correta
    const valorComPonto = valorLimpo.replace(',', '.');
    const num = parseFloat(valorComPonto);
    return isNaN(num) ? 0 : num;
  };

  // Função para aceitar apenas valores monetários na entrada
  const handleRawValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Permite apenas números e vírgula/ponto
    let valor = e.target.value.replace(/[^\d,\.]/g, '');

    // Substitui ponto por vírgula para padrão brasileiro
    valor = valor.replace('.', ',');

    // Garante apenas uma vírgula
    const partes = valor.split(',');
    if (partes.length > 1) {
      valor = partes[0] + ',' + partes[1];
    }

    // Limita a 2 casas decimais
    if (partes.length > 1 && partes[1].length > 2) {
      valor = partes[0] + ',' + partes[1].substring(0, 2);
    }

    // Converte para número e atualiza o estado
    const numero = converterParaNumero(valor);
    setValorUnitario(valor === '' ? '' : numero);

    // Atualiza o campo com o valor formatado apropriadamente
    e.target.value = valor;
  };

  // Handlers de formulário
  const handleClienteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTipoProdutoSelecionado(e.target.value as TipoProduto);
    setProdutoSelecionado(null);
  };

  const handleQuantidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuantidade(parseInt(e.target.value, 10) || 1);
  };

  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleRawValorChange(e);
  };

  const handleDescontoChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleRawValorChange(e);
    const d = converterParaNumero(e.target.value);
    setTotais(prev => ({ ...prev, desconto: d, total: prev.subtotal - d }));
  };

  // Modal e seleção de produto
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const selecionarProduto = (produto: ProdutoDisponivel) => {
    setProdutoSelecionado(produto);
    setValorUnitario(produto.valorPadrao);
    fecharModal();
  };

  // Adicionar e remover produtos
  const adicionarProduto = () => {
    if (!produtoSelecionado) {
      alert('Selecione um produto ou serviço.');
      return;
    }

    const valorUnit = valorUnitario === '' ? produtoSelecionado.valorPadrao : valorUnitario;
    const total = quantidade * valorUnit;

    const novo: ProdutoAdicionado = {
      id: Date.now(),
      tipo: tipoProdutoSelecionado,
      codigo: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      quantidade,
      valorUnitario: valorUnit,
      valorTotal: total,
    };

    setProdutos(prev => [...prev, novo]);
    setProdutoSelecionado(null);
    setQuantidade(1);
    setValorUnitario('');
  };

  const removerProduto = (id: number) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  // Cálculo de totais
  useEffect(() => {
    const sub = produtos.reduce((sum, p) => sum + p.valorTotal, 0);
    setTotais(prev => ({ ...prev, subtotal: sub, total: sub - prev.desconto }));
  }, [produtos]);

  // Finalizar orçamento
  const finalizarOrcamento = () => {
    if (!cliente.codigo || !cliente.nome) {
      alert('Preencha os dados do cliente.');
      return;
    }

    if (produtos.length === 0) {
      alert('Adicione pelo menos um produto ou serviço.');
      return;
    }

    alert('Orçamento finalizado com sucesso!');
    navigate('/orcamentos');
  };

  // Abrir modal de estatísticas
  const abrirEstatisticas = () => {
    setEstatisticaModalAberto(true);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Novo Orçamento</PageTitle>
        <BackButton onClick={() => navigate('/orcamentos')}>Voltar</BackButton>
      </PageHeader>

      <Section>
        <SectionTitle>Dados do Cliente</SectionTitle>
        <ClientForm>
          {(['codigo', 'nome', 'cnpj', 'telefone', 'email', 'endereco'] as const).map(field => (
            <FormGroup key={field}>
              <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
              <Input name={field} value={cliente[field]} onChange={handleClienteChange} />
            </FormGroup>
          ))}
        </ClientForm>
      </Section>

      <Section>
        <SectionTitle>Produtos e Serviços</SectionTitle>
        <AddProductForm>
          <FormGroup>
            <Label>Tipo</Label>
            <Select value={tipoProdutoSelecionado} onChange={handleTipoChange}>
              <option value="servico">Serviço</option>
              <option value="material">Material</option>
            </Select>
          </FormGroup>
          <FormControl>
            <Label>Produto</Label>
            <Input
              readOnly
              placeholder="Clique para selecionar"
              value={produtoSelecionado ? `${produtoSelecionado.codigo} - ${produtoSelecionado.descricao}` : ''}
              onClick={abrirModal}
            />
            <SearchButton onClick={abrirModal}>🔍</SearchButton>
          </FormControl>
          <FormGroup>
            <Label>Qtd</Label>
            <Input type="number" min="1" value={quantidade} onChange={handleQuantidadeChange} />
          </FormGroup>
          <FormGroup>
            <Label>Valor Unit.</Label>
            <Input
              value={valorUnitario === '' ? '' : valorUnitario.toString().replace('.', ',')}
              onChange={handleValorChange}
              placeholder="0,00"
            />
          </FormGroup>
          <AddButtonContainer>
            <AddButton onClick={adicionarProduto}>Adicionar</AddButton>
          </AddButtonContainer>
        </AddProductForm>

        <TableWrapper>
          <Table>
            <TableHead>
              <tr>
                <TableHeadCell>Código</TableHeadCell>
                <TableHeadCell>Descrição</TableHeadCell>
                <TableHeadCell>Tipo</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'right' }}>Qtd</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'right' }}>Unit.</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'right' }}>Total</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </tr>
            </TableHead>
            <tbody>
              {produtos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: 'center' }}>
                    Nenhum produto adicionado
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.codigo}</TableCell>
                    <TableCell>{p.descricao}</TableCell>
                    <TableCell>{p.tipo === 'servico' ? 'Serviço' : 'Material'}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{p.quantidade}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{formatarMoeda(p.valorUnitario)}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{formatarMoeda(p.valorTotal)}</TableCell>
                    <ActionCell>
                      <DeleteButton onClick={() => removerProduto(p.id)}>🗑️</DeleteButton>
                    </ActionCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>

        <TotalsContainer>
          <TotalRow>
            <TotalLabel>Subtotal:</TotalLabel>
            <TotalValue>{formatarMoeda(totais.subtotal)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>Desconto:</TotalLabel>
            <InputWrapper>
              <Input
                value={totais.desconto === 0 ? '' : totais.desconto.toString().replace('.', ',')}
                onChange={handleDescontoChange}
                placeholder="0,00"
                style={{ textAlign: 'right' }}
              />
            </InputWrapper>
          </TotalRow>
          <TotalRow>
            <TotalLabel>Total:</TotalLabel>
            <TotalValue final>{formatarMoeda(totais.total)}</TotalValue>
          </TotalRow>
          <ButtonContainer>
            <StatsButton onClick={abrirEstatisticas}>
              Ver Estatísticas
            </StatsButton>
            <VisualizarButton onClick={() => setVisualizarModalAberto(true)}>
              Visualizar Orçamento
            </VisualizarButton>
            <FinalizeButton onClick={finalizarOrcamento}>Finalizar Orçamento</FinalizeButton>
          </ButtonContainer>
        </TotalsContainer>
      </Section>

      {/* Componente Modal separado que agora busca os dados do JSON */}
      <ProdutosModal
        isOpen={modalAberto}
        onClose={fecharModal}
        tipoProdutoSelecionado={tipoProdutoSelecionado}
        onSelectProduto={selecionarProduto}
      />

      {/* Modal de estatísticas */}
      <EstatisticaModal
        isOpen={estatisticaModalAberto}
        onClose={() => setEstatisticaModalAberto(false)}
        cliente={cliente}
        produtos={produtos}
        totais={totais}
      />

      {/* Modal de visualização */}
      <EstatisticaModal
        isOpen={visualizarModalAberto}
        onClose={() => setVisualizarModalAberto(false)}
        cliente={cliente}
        produtos={produtos}
        totais={totais}
      />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
`;

const BackButton = styled.button`
  background: #7f8c8d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #95a5a6;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f1f2f6;
  padding-bottom: 0.75rem;
`;

const ClientForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormControl = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dcdde1;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 1px;
  top: 1px;
  bottom: 1px;
  background: #f1f2f6;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 0.8rem;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #dcdde1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dcdde1;
  border-radius: 4px;
  font-size: 0.9rem;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 1.2rem auto;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const AddProductForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 0.5fr 1fr 0.5fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
`;

const AddButton = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  
  &:hover {
    background: #27ae60;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f8f9fa;
`;

const TableHeadCell = styled.th`
  padding: 0.75rem;
  border-bottom: 2px solid #dcdde1;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #f1f2f6;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #dcdde1;
  color: #2c3e50;
`;

const ActionCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #dcdde1;
  text-align: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem 0.5rem;
  
  &:hover {
    color: #c0392b;
  }
`;

const TotalsContainer = styled.div`
  margin-left: auto;
  width: 100%;
  max-width: 400px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  
  &:last-child {
    border-top: 1px solid #dcdde1;
    padding-top: 1rem;
    margin-top: 0.5rem;
  }
`;

const TotalLabel = styled.span`
  font-weight: 600;
  color: #2c3e50;
`;

const TotalValue = styled.span<{ final?: boolean }>`
  font-weight: ${props => props.final ? '700' : '500'};
  font-size: ${props => props.final ? '1.2rem' : '1rem'};
  color: ${props => props.final ? '#2ecc71' : '#2c3e50'};
`;

const InputWrapper = styled.div`
  width: 150px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const StatsButton = styled.button`
  background: #9b59b6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #8e44ad;
  }
`;

const VisualizarButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2980b9;
  }
`;

const FinalizeButton = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #27ae60;
  }
`;

export default Orcamento;