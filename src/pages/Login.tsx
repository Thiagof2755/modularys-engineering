// src/pages/Login.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    const isSuccess = login(username, password);
    if (isSuccess) {
      navigate('/');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <FlexContainer justify="center">
            <LogoIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </LogoIcon>
            <Logo>
              Modularys <span>Engineering</span>
            </Logo>
          </FlexContainer>
          <p style={{ marginTop: '1rem' }}>Sistema Integrado de Engenharia</p>
        </AuthHeader>

        <AuthBody>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' }}>Login</h2>
          {error && <Alert>{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="username">Usuário</Label>
              <Input
                type="text"
                id="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>

            <Button type="submit">Entrar</Button>
          </Form>

          <FlexContainer justify="flex-end" style={{ marginTop: '1rem' }}>
            <a href="#" style={{ fontSize: '0.9rem' }}>Esqueceu a senha?</a>
          </FlexContainer>
        </AuthBody>

        <AuthFooter>
          <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Use: usuário <strong>admin</strong> e senha <strong>admin123</strong></p>
          <p style={{ color: '#7f8c8d', fontSize: '0.8rem', marginTop: '0.5rem' }}>© 2025 Modularys Engineering. Todos os direitos reservados.</p>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login;

/* Animação de fade in */
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* Container geral da tela */
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbfc, #e6f2f8);

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

/* Card de autenticação */
const AuthCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  margin: 0 1rem; /* Garante espaçamento nas laterais em telas pequenas */
`;

/* Cabeçalho */
const AuthHeader = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  text-align: center;

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

/* Corpo do form */
const AuthBody = styled.div`
  padding: 2rem;

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

/* Rodapé */
const AuthFooter = styled.div`
  padding: 1.5rem 2rem;
  background-color: #f2f6f8;
  text-align: center;
  border-top: 1px solid #dce3e8;

  @media (max-width: 480px) {
    padding: 1rem;
    font-size: 0.8rem;
  }
`;

/* Formulário */
const Form = styled.form`
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

/* Agrupamento dos campos */
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

/* Labels */
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
`;

/* Inputs */
const Input = styled.input`
  width: 90%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #dce3e8;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  &::placeholder {
    color: #a0aab3;
  }
`;

/* Botão de envio */
const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  background-color: #2c3e50;
  color: white;
  border: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1e2b38;
  }
`;

/* Alerta para erros */
const Alert = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
`;

/* Container flexível para alinhamento */
const FlexContainer = styled.div<{ justify?: string }>`
  display: flex;
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: center;
  gap: 1rem;
`;

/* Logo */
const Logo = styled.div`
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
  display: flex;
  align-items: center;

  span {
    color:rgb(0, 204, 255);
  }
`;

/* Ícone do logo */
const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
`;
