// src/pages/OrcamentoPage.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import ClientesModal from '../../components/ClientesModal';
import { Cliente } from '../../types/orcamento.types';

const OrcamentoPage: React.FC = () => {
    const [showClienteModal, setShowClienteModal] = useState<boolean>(false);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

    // Estados para os campos do cabeçalho
    const [clienteCodigo, setClienteCodigo] = useState<string>('');
    const [clienteNome, setClienteNome] = useState<string>('');
    const [clienteCnpj, setClienteCnpj] = useState<string>('');
    const [clienteTelefone, setClienteTelefone] = useState<string>('');
    const [clienteEmail, setClienteEmail] = useState<string>('');

    // Função para lidar com a seleção de cliente
    const handleSelectCliente = (cliente: Cliente) => {
        setSelectedCliente(cliente);
        setClienteCodigo(cliente.codigo);
        setClienteNome(cliente.nome);
        setClienteCnpj(cliente.cnpj);
        setClienteTelefone(cliente.telefone || '');
        setClienteEmail(cliente.email || '');
    };

    // Função para abrir modal de busca
    const handleOpenClienteModal = () => {
        setShowClienteModal(true);
    };

    // Função para fechar modal de busca
    const handleCloseClienteModal = () => {
        setShowClienteModal(false);
    };

    return (
        <Container>
            <PageHeader>
                <h1>Novo Orçamento</h1>
                <Button>Salvar</Button>
            </PageHeader>

            <Section>
                <SectionTitle>Dados do Cliente</SectionTitle>

                <ClienteHeader>
                    <SearchButton onClick={handleOpenClienteModal}>
                        <SearchIcon>🔍</SearchIcon>
                        Buscar Cliente
                    </SearchButton>

                    <ClienteForm>
                        <FormGroup>
                            <FormLabel>Código</FormLabel>
                            <FormInput
                                type="text"
                                value={clienteCodigo}
                                onChange={(e) => !selectedCliente && setClienteCodigo(e.target.value)}
                                disabled={!!selectedCliente}
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Nome</FormLabel>
                            <FormInput
                                type="text"
                                value={clienteNome}
                                onChange={(e) => !selectedCliente && setClienteNome(e.target.value)}
                                disabled={!!selectedCliente}
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>CNPJ</FormLabel>
                            <FormInput
                                type="text"
                                value={clienteCnpj}
                                onChange={(e) => !selectedCliente && setClienteCnpj(e.target.value)}
                                disabled={!!selectedCliente}
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Telefone</FormLabel>
                            <FormInput
                                type="text"
                                value={clienteTelefone}
                                onChange={(e) => !selectedCliente && setClienteTelefone(e.target.value)}
                                disabled={!!selectedCliente}
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>E-mail</FormLabel>
                            <FormInput
                                type="email"
                                value={clienteEmail}
                                onChange={(e) => !selectedCliente && setClienteEmail(e.target.value)}
                                disabled={!!selectedCliente}
                            />
                        </FormGroup>
                    </ClienteForm>
                </ClienteHeader>
            </Section>

            {/* Modal de busca de clientes */}
            <ClientesModal
                isOpen={showClienteModal}
                onClose={handleCloseClienteModal}
                onSelectCliente={handleSelectCliente}
            />
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
        font-size: 1.8rem;
        color: #343a40;
        margin: 0;
    }
`;

const Button = styled.button`
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    
    &:hover {
        background-color: #0069d9;
    }
`;

const Section = styled.section`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
    overflow: hidden;
`;

const SectionTitle = styled.h2`
    font-size: 1.2rem;
    color: #495057;
    margin: 0;
    padding: 15px 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
`;

const ClienteHeader = styled.div`
    padding: 20px;
`;

const SearchButton = styled.button`
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    margin-bottom: 20px;
    
    &:hover {
        background-color: #e9ecef;
    }
`;

const SearchIcon = styled.span`
    margin-right: 10px;
`;

const ClienteForm = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const FormLabel = styled.label`
    font-size: 0.9rem;
    color: #495057;
    margin-bottom: 5px;
`;

const FormInput = styled.input`
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.95rem;
    
    &:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    &:disabled {
        background-color: #e9ecef;
        cursor: not-allowed;
    }
`;

export default OrcamentoPage;