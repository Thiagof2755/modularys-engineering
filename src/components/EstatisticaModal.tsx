import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cliente, ProdutoAdicionado, Totais } from '../types/orcamento.types';

interface EstatisticaModalProps {
    isOpen: boolean;
    onClose: () => void;
    cliente: Cliente;
    produtos: ProdutoAdicionado[];
    totais: Totais;
}

interface RateioCalculo {
    valorTotalOrcamento: number;
    valorServico: number;
    valorMaterial: number;
    lucroServico: number;
    lucroMaterial: number;
    lucroTotal: number;
    custoServicoLiquido: number;
    custoMaterialLiquido: number;
    salarioBruto: number;
    salarioPedreiro: number;
    inss: number;
    fgts: number;
    ferias: number;
    decimoTerceiro: number;
    outrosEncargos: number;
    valorEncargos: number;
    custoTotalMaoDeObra: number;
    impostoServicoPercentual: number;
    valorImpostoServico: number;
    sobra: number;
    percentualEncargos: number;
}

const EstatisticaModal: React.FC<EstatisticaModalProps> = ({
    isOpen,
    onClose,
    cliente,
    produtos,
    totais
}) => {
    const PERCENTUAL_SERVICO = 50; // % do orçamento dedicado a serviço
    const PERCENTUAL_LUCRO_SERVICO = 20; // % de lucro sobre serviço
    const PERCENTUAL_LUCRO_MATERIAL = 20; // % de lucro sobre material
    const PERCENTUAL_IMPOSTO_SERVICO = 15; // ISS 15% como solicitado
    // Encargos trabalhistas fixos:
    const P_INSS = 15;
    const P_FGTS = 8;
    const P_FERIAS = 8.33;
    const P_DECIMO = 8.33;
    const P_OUTROS = 5;

    const [rateio, setRateio] = useState<RateioCalculo | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (totais) calcularRateio();
    }, [totais]);

    useEffect(() => {
        if (rateio) {
            prepareChartData();
        }
    }, [rateio]);

    const calcularRateio = () => {
        const valorTotalOrcamento = totais.total;
        const valorServico = (valorTotalOrcamento * PERCENTUAL_SERVICO) / 100;
        const valorMaterial = valorTotalOrcamento - valorServico;

        const lucroServico = (valorServico * PERCENTUAL_LUCRO_SERVICO) / 100;
        const lucroMaterial = (valorMaterial * PERCENTUAL_LUCRO_MATERIAL) / 100;
        const lucroTotal = lucroServico + lucroMaterial;

        const custoServicoLiquido = valorServico - lucroServico;
        const custoMaterialLiquido = valorMaterial - lucroMaterial;

        // Percentual total dos encargos
        const percentualEncargos = P_INSS + P_FGTS + P_FERIAS + P_DECIMO + P_OUTROS;
        
        // Calcula o valor bruto (antes dos encargos)
        // 80% do valor do serviço vai para a mão de obra
        const salarioBruto = valorServico * 0.8;
        
        // Calcula o valor líquido do pedreiro (já descontando os encargos)
        // Fórmula: Valor Bruto / (1 + percentualEncargos/100)
        const salarioPedreiro = salarioBruto / (1 + (percentualEncargos / 100));
        
        // Calcula os encargos a partir do salário líquido
        const inss = (salarioPedreiro * P_INSS) / 100;
        const fgts = (salarioPedreiro * P_FGTS) / 100;
        const ferias = (salarioPedreiro * P_FERIAS) / 100;
        const decimoTerceiro = (salarioPedreiro * P_DECIMO) / 100;
        const outrosEncargos = (salarioPedreiro * P_OUTROS) / 100;
        const valorEncargos = inss + fgts + ferias + decimoTerceiro + outrosEncargos;
        
        // Confirma que salário + encargos = valor bruto
        const custoTotalMaoDeObra = salarioPedreiro + valorEncargos;

        const valorImpostoServico = (valorServico * PERCENTUAL_IMPOSTO_SERVICO) / 100;

        const sobra = custoServicoLiquido - custoTotalMaoDeObra - valorImpostoServico;

        setRateio({
            valorTotalOrcamento,
            valorServico,
            valorMaterial,
            lucroServico,
            lucroMaterial,
            lucroTotal,
            custoServicoLiquido,
            custoMaterialLiquido,
            salarioBruto,
            salarioPedreiro,
            inss,
            fgts,
            ferias,
            decimoTerceiro,
            outrosEncargos,
            valorEncargos,
            custoTotalMaoDeObra,
            impostoServicoPercentual: PERCENTUAL_IMPOSTO_SERVICO,
            valorImpostoServico,
            sobra,
            percentualEncargos
        });
    };

    const prepareChartData = () => {
        if (!rateio) return;

        const data = [
            { name: 'Lucro Serviço', value: rateio.lucroServico, color: '#16a34a' },
            { name: 'Lucro Material', value: rateio.lucroMaterial, color: '#22c55e' },
            { name: 'Salário Funcionário', value: rateio.salarioPedreiro, color: '#0ea5e9' },
            { name: 'Encargos', value: rateio.valorEncargos, color: '#3b82f6' },
            { name: 'ISS', value: rateio.valorImpostoServico, color: '#ef4444' },
            { name: 'Custo Material', value: rateio.custoMaterialLiquido, color: '#f59e0b' },
            { name: 'Sobra', value: rateio.sobra > 0 ? rateio.sobra : 0, color: '#8b5cf6' }
        ];

        setChartData(data);
    };

    const formatarMoeda = (valor: number): string =>
        valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatarPercentual = (valor: number): string =>
        valor.toFixed(2) + '%';

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <TooltipContainer>
                    <TooltipLabel>{payload[0].name}</TooltipLabel>
                    <TooltipValue>{formatarMoeda(payload[0].value)}</TooltipValue>
                    <TooltipPercentage>
                        {rateio ? formatarPercentual((payload[0].value / rateio.valorTotalOrcamento) * 100) : ''}
                    </TooltipPercentage>
                </TooltipContainer>
            );
        }
        return null;
    };

    if (!isOpen || !rateio) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Rateio do Orçamento</ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>
                <ModalContent>
                    <Section>
                        <SectionTitle>Dados do Cliente</SectionTitle>
                        <InfoGrid>
                            <InfoItem><InfoLabel>Código:</InfoLabel><InfoValue>{cliente.codigo}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Nome:</InfoLabel><InfoValue>{cliente.nome}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>CNPJ:</InfoLabel><InfoValue>{cliente.cnpj}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Telefone:</InfoLabel><InfoValue>{cliente.telefone}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Email:</InfoLabel><InfoValue>{cliente.email}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Endereço:</InfoLabel><InfoValue>{cliente.endereco}</InfoValue></InfoItem>
                        </InfoGrid>
                    </Section>
                    
                    <SummaryCards>
                        <SummaryCard>
                            <CardTitle>Valor Total</CardTitle>
                            <CardValue>{formatarMoeda(rateio.valorTotalOrcamento)}</CardValue>
                        </SummaryCard>
                        <SummaryCard>
                            <CardTitle>Lucro Total</CardTitle>
                            <CardValue highlight>{formatarMoeda(rateio.lucroTotal)}</CardValue>
                            <CardSubtitle>{formatarPercentual((rateio.lucroTotal / rateio.valorTotalOrcamento) * 100)}</CardSubtitle>
                        </SummaryCard>
                        <SummaryCard>
                            <CardTitle>ISS (15%)</CardTitle>
                            <CardValue warning>{formatarMoeda(rateio.valorImpostoServico)}</CardValue>
                        </SummaryCard>
                    </SummaryCards>
                    
                    <ChartSection>
                        <SectionTitle>Distribuição de Custos e Lucros</SectionTitle>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </ChartSection>
                    
                    <TwoColumnsSection>
                        <Column>
                            <SectionTitle>Valores & Lucros</SectionTitle>
                            <StyledTable>
                                <tbody>
                                    <tr><TableLabel>Total Orçamento:</TableLabel><TableValue>{formatarMoeda(rateio.valorTotalOrcamento)}</TableValue></tr>
                                    <tr><TableLabel>Serviço (50%):</TableLabel><TableValue>{formatarMoeda(rateio.valorServico)}</TableValue></tr>
                                    <tr><TableLabel>Material (50%):</TableLabel><TableValue>{formatarMoeda(rateio.valorMaterial)}</TableValue></tr>
                                    <tr className="highlight"><TableLabel>Lucro Serviço (20%):</TableLabel><TableValue highlight>{formatarMoeda(rateio.lucroServico)}</TableValue></tr>
                                    <tr><TableLabel>Lucro Material (20%):</TableLabel><TableValue>{formatarMoeda(rateio.lucroMaterial)}</TableValue></tr>
                                    <tr className="highlight"><TableLabel>Lucro Total:</TableLabel><TableValue highlight>{formatarMoeda(rateio.lucroTotal)}</TableValue></tr>
                                </tbody>
                            </StyledTable>
                        </Column>
                        <Column>
                            <SectionTitle>Impostos & Custos</SectionTitle>
                            <StyledTable>
                                <tbody>
                                    <tr><TableLabel>Custo Serviço Líquido:</TableLabel><TableValue>{formatarMoeda(rateio.custoServicoLiquido)}</TableValue></tr>
                                    <tr><TableLabel>ISS ({PERCENTUAL_IMPOSTO_SERVICO}%):</TableLabel><TableValue warning>{formatarMoeda(rateio.valorImpostoServico)}</TableValue></tr>
                                    <tr><TableLabel>Custo Material Líquido:</TableLabel><TableValue>{formatarMoeda(rateio.custoMaterialLiquido)}</TableValue></tr>
                                    <tr className="highlight"><TableLabel>Sobra para Custos Indiretos:</TableLabel><TableValue accent>{formatarMoeda(rateio.sobra)}</TableValue></tr>
                                    <tr><TableLabel>Rentabilidade:</TableLabel><TableValue>{formatarPercentual((rateio.lucroTotal / rateio.valorTotalOrcamento) * 100)}</TableValue></tr>
                                </tbody>
                            </StyledTable>
                        </Column>
                    </TwoColumnsSection>
                    
                    <Section>
                        <SectionTitle>Mão de Obra & Encargos</SectionTitle>
                        <InfoBox>
                            <InfoBoxTitle>Informação Importante</InfoBoxTitle>
                            <InfoBoxText>
                                <p>O <strong>valor pago ao funcionário</strong> já considera o desconto dos encargos trabalhistas de <strong>{formatarPercentual(rateio.percentualEncargos)}</strong>.</p>
                                <p>80% do valor do serviço é destinado à mão de obra (incluindo encargos) e 20% ao lucro da empresa.</p>
                            </InfoBoxText>
                        </InfoBox>
                        <MaoDeObraTable>
                            <thead>
                                <tr>
                                    <MaoDeObraHeader>Descrição</MaoDeObraHeader>
                                    <MaoDeObraHeader>Percentual</MaoDeObraHeader>
                                    <MaoDeObraHeader>Valor</MaoDeObraHeader>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="total">
                                    <MaoDeObraCell bold>Valor Bruto (80% do serviço)</MaoDeObraCell>
                                    <MaoDeObraCell>100%</MaoDeObraCell>
                                    <MaoDeObraCell bold>{formatarMoeda(rateio.salarioBruto)}</MaoDeObraCell>
                                </tr>
                                <tr className="destaque">
                                    <MaoDeObraCell bold>Valor Pago ao Funcionário</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarPercentual(100 / (1 + rateio.percentualEncargos/100))}</MaoDeObraCell>
                                    <MaoDeObraCell bold>{formatarMoeda(rateio.salarioPedreiro)}</MaoDeObraCell>
                                </tr>
                                <tr>
                                    <MaoDeObraCell indent>INSS ({P_INSS}%)</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarPercentual(P_INSS)}</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarMoeda(rateio.inss)}</MaoDeObraCell>
                                </tr>
                                <tr>
                                    <MaoDeObraCell indent>FGTS ({P_FGTS}%)</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarPercentual(P_FGTS)}</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarMoeda(rateio.fgts)}</MaoDeObraCell>
                                </tr>
                                <tr>
                                    <MaoDeObraCell indent>Férias ({P_FERIAS}%)</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarPercentual(P_FERIAS)}</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarMoeda(rateio.ferias)}</MaoDeObraCell>
                                </tr>
                                <tr>
                                    <MaoDeObraCell indent>13º ({P_DECIMO}%)</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarPercentual(P_DECIMO)}</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarMoeda(rateio.decimoTerceiro)}</MaoDeObraCell>
                                </tr>
                                <tr>
                                    <MaoDeObraCell indent>Outros ({P_OUTROS}%)</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarPercentual(P_OUTROS)}</MaoDeObraCell>
                                    <MaoDeObraCell>{formatarMoeda(rateio.outrosEncargos)}</MaoDeObraCell>
                                </tr>
                                <tr className="total">
                                    <MaoDeObraCell bold>Total Encargos</MaoDeObraCell>
                                    <MaoDeObraCell bold>{formatarPercentual(rateio.percentualEncargos)}</MaoDeObraCell>
                                    <MaoDeObraCell bold>{formatarMoeda(rateio.valorEncargos)}</MaoDeObraCell>
                                </tr>
                                <tr className="confirmacao">
                                    <MaoDeObraCell bold>Total Mão de Obra + Encargos</MaoDeObraCell>
                                    <MaoDeObraCell></MaoDeObraCell>
                                    <MaoDeObraCell bold>{formatarMoeda(rateio.custoTotalMaoDeObra)}</MaoDeObraCell>
                                </tr>
                            </tbody>
                        </MaoDeObraTable>
                    </Section>
                </ModalContent>
                <ModalFooter>
                    <PrintButton>Imprimir</PrintButton>
                    <Button onClick={onClose}>Fechar</Button>
                </ModalFooter>
            </ModalContainer>
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  color: #1e3a8a;
  margin: 0;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: #1e3a8a;
    background-color: #e5e7eb;
  }
`;

const ModalContent = styled.div`
  padding: 2rem;
  overflow-y: auto;
`;

const Section = styled.section`
  margin-bottom: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ChartSection = styled(Section)`
  display: flex;
  flex-direction: column;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const TwoColumnsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #1e3a8a;
  margin-top: 0;
  margin-bottom: 1.25rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 60px;
    background-color: #1e3a8a;
    border-radius: 3px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  margin-bottom: 0.75rem;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #6b7280;
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
`;

const InfoValue = styled.span`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 500;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const CardTitle = styled.h4`
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
`;

const CardValue = styled.div<{ highlight?: boolean; accent?: boolean; warning?: boolean }>`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: ${props => {
    if (props.highlight) return '#16a34a';
    if (props.accent) return '#2563eb';
    if (props.warning) return '#ef4444';
    return '#1e293b';
  }};
`;

const CardSubtitle = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  tr {
    border-bottom: 1px solid #f3f4f6;
    
    &.highlight {
      background-color: #f0fdf4;
      font-weight: 600;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const TableLabel = styled.td<{ indent?: boolean }>`
  padding: 0.75rem 0;
  color: #4b5563;
  padding-left: ${props => props.indent ? '1.5rem' : '0'};
  font-weight: 500;
`;

const TableValue = styled.td<{ highlight?: boolean; accent?: boolean; warning?: boolean }>`
  padding: 0.75rem 0;
  text-align: right;
  font-weight: ${props => (props.highlight || props.accent || props.warning) ? '600' : '500'};
  color: ${props => {
    if (props.accent) return '#2563eb';
    if (props.highlight) return '#16a34a';
    if (props.warning) return '#ef4444';
    return '#1f2937';
  }};
`;

const MaoDeObraTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  thead {
    background-color: #f1f5f9;
  }
  
  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.destaque {
      background-color: #ecfdf5;
      font-weight: 600;
    }
    
    &.total {
      background-color: #f8fafc;
      font-weight: 600;
    }
    
    &.confirmacao {
      background-color: #eff6ff;
    }
  }
`;

const MaoDeObraHeader = styled.th`
  text-align: left;
  padding: 1rem;
  color: #334155;
  font-weight: 600;
  font-size: 0.875rem;
  
  &:last-child {
    text-align: right;
  }
  
  &:nth-child(2) {
    text-align: center;
  }
`;

const MaoDeObraCell = styled.td<{ indent?: boolean; bold?: boolean }>`
  padding: 0.75rem 1rem;
  color: #1e293b;
  font-weight: ${props => props.bold ? '600' : 'normal'};
  padding-left: ${props => props.indent ? '2rem' : '1rem'};
  
  &:last-child {
    text-align: right;
  }
  
  &:nth-child(2) {
    text-align: center;
  }
`;

const InfoBox = styled.div`
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  border-left: 4px solid #0ea5e9;
  margin-bottom: 1.5rem;
`;

const InfoBoxTitle = styled.h4`
  color: #0369a1;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
`;

const InfoBoxText = styled.div`
  color: #334155;
  font-size: 0.925rem;
  
  p {
    margin: 0.5rem 0;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #0c4a6e;
    font-weight: 600;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
`;

const Button = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const PrintButton = styled(Button)`
  background: #1e40af;
  color: white;
  border: none;
  
  &:hover {
    background: #1e3a8a;
  }
`;

const TooltipContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
`;

const TooltipLabel = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #4b5563;
`;

const TooltipValue = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
`;

const TooltipPercentage = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;
export default EstatisticaModal;