import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    DollarSign,
    Users,
    BarChart2,
    Briefcase,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Tipos
interface Module {
    title: string;
    path: string;
    icon: React.ReactNode;
}

interface MainLayoutProps {
    children: React.ReactNode;
}

interface SidebarProps {
    isCollapsed: boolean;
}

interface NavItemProps {
    isActive?: boolean;
}

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside<SidebarProps>`
  width: ${props => props.isCollapsed ? '80px' : '260px'};
  background-color: #1e293b;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width 0.3s ease-in-out;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 0.375rem;
  
  &:hover {
    color: #f8fafc;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const LogoContainer = styled.div<SidebarProps>`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  margin-bottom: 2.5rem;
  padding-left: ${props => props.isCollapsed ? '0' : '0.5rem'};
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  margin-left: 0.5rem;
`;

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
`;

const NavItem = styled.button<NavItemProps>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: ${props => props.isActive ? '#334155' : 'transparent'};
  color: ${props => props.isActive ? '#f8fafc' : '#94a3b8'};
  text-align: left;
  width: 100%;
  
  &:hover {
    background-color: ${props => props.isActive ? '#334155' : '#2c3e50'};
    color: #f8fafc;
  }
`;

const LogoutButton = styled(NavItem)`
  margin-top: auto;
  color: #f87171;
  
  &:hover {
    background-color: #991b1b;
    color: #fecaca;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  background-color: #f8fafc;
  padding: 2rem;
  overflow-y: auto;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
`;

// Componente principal
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const modules: Module[] = [
        { title: 'Home', path: '/', icon: <Home size={20} /> },
        { title: 'Orçamento', path: '/orcamento', icon: <DollarSign size={20} /> },
        { title: 'Funcionários', path: '/funcionarios', icon: <Users size={20} /> },
        { title: 'Projetos', path: '/projetos', icon: <BarChart2 size={20} /> },
        { title: 'Recursos', path: '/recursos', icon: <Briefcase size={20} /> },
        { title: 'Relatórios', path: '/relatorios', icon: <FileText size={20} /> },
    ];

    const handleNavigation = (path: string): void => {
        navigate(path);
    };

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    return (
        <Container>
            <Sidebar isCollapsed={isCollapsed}>
                <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </ToggleButton>

                <LogoContainer isCollapsed={isCollapsed}>
                    <Building size={24} />
                    {!isCollapsed && <LogoText>Modularys</LogoText>}
                </LogoContainer>

                <NavContainer>
                    {modules.map((mod, idx) => (
                        <NavItem
                            key={idx}
                            isActive={location.pathname === mod.path ||
                                (mod.path !== '/' && location.pathname.startsWith(mod.path))}
                            onClick={() => handleNavigation(mod.path)}
                        >
                            <IconWrapper>{mod.icon}</IconWrapper>
                            {!isCollapsed && mod.title}
                        </NavItem>
                    ))}

                    <LogoutButton onClick={handleLogout}>
                        <IconWrapper><LogOut size={20} /></IconWrapper>
                        {!isCollapsed && 'Sair'}
                    </LogoutButton>
                </NavContainer>
            </Sidebar>

            <MainContent>
                {children}
            </MainContent>
        </Container>
    );
};

export default MainLayout;