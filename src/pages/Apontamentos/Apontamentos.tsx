import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload } from 'lucide-react';
import ActivityModal from './ActivityModal';

// Define TypeScript interfaces
export interface ActivityEntry {
  empresa: string;
  responsavel: string;
  solicitante: string;
  atividade: string;
  data: string;
  tempo_gasto: string;
  descritivo: string;
}

export interface ActivityData {
  dashboard_info: {
    title: string;
    date: string;
    last_update: string;
  };
  companies: {
    executing_company: string;
    contracting_company: string;
  };
  entries: ActivityEntry[];
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const UploadCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: all 0.3s ease;
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #0a2647;
  margin-bottom: 16px;
`;

const CardDescription = styled.p`
  color: #64748b;
  margin-bottom: 32px;
`;

const UploadArea = styled.div`
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  
  &:hover {
    border-color: #2c74b3;
    background-color: #f1f5f9;
  }
`;

const UploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: #e0f2fe;
  border-radius: 50%;
  margin-bottom: 16px;
  
  svg {
    color: #2c74b3;
  }
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #334155;
  margin-bottom: 8px;
`;

const UploadHint = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const HiddenInput = styled.input`
  display: none;
`;

// CSS for loading spinner
const spinnerCSS = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}
`;

const GlobalStyle = styled.div`
  ${spinnerCSS}
`;

const Apontamentos = () => {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle JSON file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          setActivityData(jsonData);
          setIsModalOpen(true);
        } catch (error) {
          alert('Arquivo JSON inválido');
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Container>
      <GlobalStyle />
      <UploadCard>
        <CardTitle>Relatório de Atividades</CardTitle>
        <CardDescription>
          Carregue seu arquivo JSON para visualizar o relatório de atividades
        </CardDescription>

        <label htmlFor="json-upload">
          <UploadArea>
            <UploadIcon>
              <Upload size={28} />
            </UploadIcon>
            <UploadText>Clique ou arraste seu arquivo JSON aqui</UploadText>
            <UploadHint>Suporta apenas arquivos .json</UploadHint>
          </UploadArea>
          <HiddenInput
            id="json-upload"
            type="file"
            accept=".json"
            onChange={handleFileImport}
          />
        </label>
      </UploadCard>

      {/* Modal de Atividades */}
      {isModalOpen && activityData && (
        <ActivityModal 
          activityData={activityData} 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Container>
  );
};

export default Apontamentos;