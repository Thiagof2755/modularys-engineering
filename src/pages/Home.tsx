import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

// Wrapper principal com layout mais eficiente
const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 140px); // Melhor aproveitamento do espaço vertical
`;

// Cabeçalho com design mais moderno
const Header = styled.header`
    background-color: #ffffff;
    padding: 1.2rem 2rem;
    border-bottom: 1px solid #e6e9ef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
`;

const LogoArea = styled.div`
    display: flex;
    align-items: center;
`;

const Logo = styled.h1`
    font-size: 1.6rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    
    &:before {
        content: "🏢";
        margin-right: 0.8rem;
        font-size: 1.8rem;
    }
    
    span {
        font-weight: 300;
        font-style: italic;
        color: #7f8c8d;
        margin-left: 0.5rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
`;

const Button = styled.button`
    background: #3498db;
    color: #fff;
    border: none;
    padding: 0.7rem 1.4rem;
    font-size: 0.95rem;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    font-weight: 500;
    
    &:before {
        margin-right: 0.5rem;
    }
    
    &:hover {
        background: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const NotificationButton = styled(Button)`
    &:before {
        content: "🔔";
    }
`;

const LogoutButton = styled(Button)`
    background: #e74c3c;
    
    &:before {
        content: "🚪";
    }
    
    &:hover {
        background: #c0392b;
    }
`;

// Seções com design mais limpo
const Section = styled.section`
    margin-top: 2.5rem;
    animation: fadeIn 0.5s ease-in-out;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const SectionTitle = styled.h2`
    font-size: 1.7rem;
    margin-bottom: 1.8rem;
    color: #34495e;
    border-left: 4px solid #3498db;
    padding-left: 1rem;
    font-weight: 600;
`;

// Grid com melhor responsividade
const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.8rem;
`;

// Card com design mais sofisticado
const Card = styled.div`
    background: #fff;
    padding: 1.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        border-color: #3498db40;
    }
`;

// Estilo específico para o card de módulo
const ModuleCard = styled(Card)`
    position: relative;
    overflow: hidden;
    
    &:after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        width: 100%;
        background: ${props => props.color || '#3498db'};
        transform: scaleX(0.3);
        transform-origin: left;
        transition: transform 0.3s ease;
    }
    
    &:hover:after {
        transform: scaleX(1);
    }
`;

const CardHeader = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.2rem;
`;

const ModuleIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: ${props => props.color || '#3498db'}20;
    color: ${props => props.color || '#3498db'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
`;

const CardTitle = styled.h3`
    font-size: 1.3rem;
    margin: 0;
    color: #2c3e50;
    font-weight: 600;
`;

const CardDescription = styled.p`
    font-size: 0.95rem;
    color: #7f8c8d;
    line-height: 1.5;
`;

// Rodapé com melhor integração
const Footer = styled.footer`
    margin-top: 4rem;
    text-align: center;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-top: 1px solid #e6e9ef;
    font-size: 0.9rem;
    color: #7f8c8d;
`;

const Home = () => {
        const navigate = useNavigate();
        const { logout } = useAuth();

        // Dados dos módulos
        const modules = [
                {
                        id: 1,
                        title: 'Orçamento',
                        description: 'Gerenciamento completo de orçamentos de projetos',
                        icon: '💰',
                        path: '/orcamento',
                        color: '#3498db'
                },
                {
                        id: 2,
                        title: 'Projetos',
                        description: 'Visualização e gerenciamento de projetos',
                        icon: '📊',
                        path: '/projetos',
                        color: '#27ae60'
                },
                {
                        id: 3,
                        title: 'Recursos',
                        description: 'Alocação e gerenciamento de recursos',
                        icon: '🤝',
                        path: '/recursos',
                        color: '#e67e22'
                },
                {
                        id: 4,
                        title: 'Relatórios',
                        description: 'Geração de relatórios e análises',
                        icon: '📋',
                        path: '/relatorios',
                        color: '#9b59b6'
                }
        ];

        return (
                <>
                        <Header>
                                <LogoArea>
                                        <Logo>
                                                Modularys <span>Engineering</span>
                                        </Logo>
                                </LogoArea>
                                <ButtonGroup>
                                        <NotificationButton onClick={() => { }}>Notificações</NotificationButton>
                                        <LogoutButton onClick={logout}>Sair</LogoutButton>
                                </ButtonGroup>
                        </Header>

                        <Wrapper>
                                <Section>
                                        <SectionTitle>Módulos do Sistema</SectionTitle>
                                        <Grid>
                                                {modules.map(module => (
                                                        <ModuleCard
                                                                key={module.id}
                                                                onClick={() => navigate(module.path)}
                                                                color={module.color}
                                                        >
                                                                <CardHeader>
                                                                        <ModuleIcon color={module.color}>{module.icon}</ModuleIcon>
                                                                        <CardTitle>{module.title}</CardTitle>
                                                                </CardHeader>
                                                                <CardDescription>{module.description}</CardDescription>
                                                        </ModuleCard>
                                                ))}
                                        </Grid>
                                </Section>
                        </Wrapper>

                        <Footer>
                                &copy; 2025 Modularys Engineering. Todos os direitos reservados.
                        </Footer>
                </>
        );
};

export default Home;
