import { useState, useEffect } from 'react';
import { Cliente } from '../types/orcamento.types';

const useClientes = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Buscar clientes do arquivo JSON
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                setLoading(true);
                // Buscar do arquivo JSON na pasta data
                const response = await fetch('/data/clientes.json');

                if (!response.ok) {
                    throw new Error(`Erro ao buscar clientes: ${response.status}`);
                }

                const data = await response.json();
                setClientes(data);
                setFilteredClientes(data);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar clientes:', err);
                setError('Falha ao carregar a lista de clientes. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchClientes();
    }, []);

    // Filtrar clientes com base no termo de pesquisa
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredClientes(clientes);
            return;
        }

        const termLower = searchTerm.toLowerCase();
        const filtered = clientes.filter(cliente =>
            cliente.codigo.toLowerCase().includes(termLower) ||
            cliente.nome.toLowerCase().includes(termLower) ||
            cliente.cnpj.toLowerCase().includes(termLower) ||
            cliente.email.toLowerCase().includes(termLower)
        );

        setFilteredClientes(filtered);
    }, [searchTerm, clientes]);

    // Função para atualizar o termo de busca
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    return {
        clientes: filteredClientes,
        loading,
        error,
        searchTerm,
        handleSearch
    };
};

export default useClientes;