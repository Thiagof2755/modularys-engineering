// src/components/ClientesModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import useClientes from '../hooks/useClientes';
import { Cliente } from '../types/orcamento.types';

interface ClientesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCliente: (cliente: Cliente) => void;
}

const ClientesModal: React.FC<ClientesModalProps> = ({ isOpen, onClose, onSelectCliente }) => {
    const { clientes, loading, error, searchTerm, handleSearch } = useClientes();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focar no input de pesquisa quando o modal é aberto
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Não renderizar se o modal não estiver aberto
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Buscar Cliente</ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                <SearchContainer>
                    <SearchInput
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar por código, nome, CNPJ ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <SearchIcon>🔍</SearchIcon>
                </SearchContainer>

                <ClientesContainer>
                    {loading ? (
                        <LoadingMessage>Carregando clientes...</LoadingMessage>
                    ) : error ? (
                        <ErrorMessage>{error}</ErrorMessage>
                    ) : clientes.length > 0 ? (
                        <ClienteTable>
                            <ClienteTableHead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>CNPJ</th>
                                    <th>Telefone</th>
                                </tr>
                            </ClienteTableHead>
                            <ClienteTableBody>
                                {clientes.map((cliente) => (
                                    <ClienteRow
                                        key={cliente.codigo}
                                        onClick={() => {
                                            onSelectCliente(cliente);
                                            onClose();
                                        }}
                                    >
                                        <td>{cliente.codigo}</td>
                                        <td>{cliente.nome}</td>
                                        <td>{cliente.cnpj}</td>
                                        <td>{cliente.telefone}</td>
                                    </ClienteRow>
                                ))}
                            </ClienteTableBody>
                        </ClienteTable>
                    ) : (
                        <NoResultMessage>Nenhum cliente encontrado com este termo de busca.</NoResultMessage>
                    )}
                </ClientesContainer>

                <ModalFooter>
                    <CancelButton onClick={onClose}>Cancelar</CancelButton>
                </ModalFooter>
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #343a40;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  
  &:hover {
    color: #343a40;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const ClientesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  min-height: 300px;
`;

const ClienteTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ClienteTableHead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
  
  th {
    background-color: #f8f9fa;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
  }
`;

const ClienteTableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const ClienteRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e9ecef;
  }
  
  td {
    padding: 12px 16px;
    border-bottom: 1px solid #dee2e6;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #dc3545;
  padding: 0 20px;
  text-align: center;
`;

const NoResultMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #6c757d;
  padding: 0 20px;
  text-align: center;
`;

export default ClientesModal;