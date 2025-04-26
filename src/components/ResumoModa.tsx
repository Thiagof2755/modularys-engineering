import React from 'react';
import styled from 'styled-components';
import { Cliente, ProdutoAdicionado, Totais } from '../types/orcamento.types';

interface ResumoModalProps {
    isOpen: boolean;
    onClose: () => void;
    cliente: Cliente;
    produtos: ProdutoAdicionado[];
    totais: Totais;
}

const ResumoModal: React.FC<ResumoModalProps> = ({
    isOpen,
    onClose,
    cliente,
    produtos,
    totais
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Estatísticas do Orçamento</ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>

                <ModalContent>
                    {/* Aqui será implementado o conteúdo com as estatísticas */}
                    <Section>
                        <SectionTitle>Dados do Cliente</SectionTitle>
                        <InfoContainer>
                            <InfoItem>
                                <InfoLabel>Código:</InfoLabel>
                                <InfoValue>{cliente.codigo}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Nome:</InfoLabel>
                                <InfoValue>{cliente.nome}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>CNPJ:</InfoLabel>
                                <InfoValue>{cliente.cnpj}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Telefone:</InfoLabel>
                                <InfoValue>{cliente.telefone}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Email:</InfoLabel>
                                <InfoValue>{cliente.email}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Endereço:</InfoLabel>
                                <InfoValue>{cliente.endereco}</InfoValue>
                            </InfoItem>
                        </InfoContainer>
                    </Section>

                    <Section>
                        <SectionTitle>Resumo dos Produtos</SectionTitle>
                        <InfoContainer>
                            <InfoItem>
                                <InfoLabel>Total de Itens:</InfoLabel>
                                <InfoValue>{produtos.length}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Quantidade Total:</InfoLabel>
                                <InfoValue>{produtos.reduce((sum, p) => sum + p.quantidade, 0)}</InfoValue>
                            </InfoItem>
                            {/* Espaço para outras estatísticas sobre produtos */}
                        </InfoContainer>
                    </Section>

                    <Section>
                        <SectionTitle>Valores</SectionTitle>
                        <InfoContainer>
                            <InfoItem>
                                <InfoLabel>Subtotal:</InfoLabel>
                                <InfoValue>
                                    {totais.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Desconto:</InfoLabel>
                                <InfoValue>
                                    {totais.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Total:</InfoLabel>
                                <InfoValue highlight>
                                    {totais.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </InfoValue>
                            </InfoItem>
                        </InfoContainer>
                    </Section>

                    {/* Área para gráficos ou outras análises */}
                    <Section>
                        <SectionTitle>Análise</SectionTitle>
                        <PlaceholderContainer>
                            Área reservada para gráficos e análises adicionais
                        </PlaceholderContainer>
                    </Section>
                </ModalContent>

                <ModalFooter>
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eceef0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f1f2f6;
  padding-bottom: 0.5rem;
`;

const InfoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #7f8c8d;
  display: block;
  font-size: 0.9rem;
`;

const InfoValue = styled.span<{ highlight?: boolean }>`
  color: ${props => props.highlight ? '#2ecc71' : '#2c3e50'};
  font-weight: ${props => props.highlight ? '600' : 'normal'};
  font-size: ${props => props.highlight ? '1.1rem' : '1rem'};
`;

const PlaceholderContainer = styled.div`
  background-color: #f8f9fa;
  border: 1px dashed #dcdde1;
  border-radius: 6px;
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eceef0;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2980b9;
  }
`;

export default ResumoModal;