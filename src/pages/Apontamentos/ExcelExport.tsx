import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ActivityData } from './Apontamentos';
import styled from 'styled-components';

// Styled components for UI
const ExportButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #1a73e8;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(26, 115, 232, 0.2);
  
  &:hover {
    background-color: #1557b0;
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
  }
  
  &:disabled {
    background-color: #9aa0a6;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 8px;
  }
`;

// Excel styling options
interface ExcelStyle {
  fill?: {
    fgColor: { rgb: string };
  };
  font?: {
    name: string;
    sz: number;
    color?: { rgb: string };
    bold?: boolean;
  };
  border?: {
    top: { style: string; color: { rgb: string } };
    bottom: { style: string; color: { rgb: string } };
    left: { style: string; color: { rgb: string } };
    right: { style: string; color: { rgb: string } };
  };
  alignment?: {
    horizontal: string;
    vertical: string;
    wrapText: boolean;
  };
}

// Helper functions
const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return `${hours}h ${minutes}min`;
};

const formatDate = (dateStr: string): string => {
  try {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;

    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];

    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateStr;
  }
};

// Utility for generating Excel cell references
const generateCellRange = (start: string, end: string): string => {
  return `${start}:${end}`;
};

class ExcelExport {
  // Color palette - Blue tones
  private static colors = {
    headerBg: '1a73e8', // Main blue
    headerFont: 'FFFFFF', // White
    subHeaderBg: 'aecbfa', // Light blue
    subHeaderFont: '174ea6', // Dark blue
    evenRowBg: 'e8f0fe', // Very light blue
    oddRowBg: 'FFFFFF', // White
    borderColor: 'd2e3fc', // Lighter blue
    totalsBg: 'c2dbff', // Medium light blue
    totalsFont: '185abc', // Darker blue
  };

  // Excel cell styling functions
  private static createHeaderStyle(): ExcelStyle {
    return {
      fill: { fgColor: { rgb: this.colors.headerBg } },
      font: { name: 'Arial', sz: 12, color: { rgb: this.colors.headerFont }, bold: true },
      border: {
        top: { style: 'thin', color: { rgb: this.colors.borderColor } },
        bottom: { style: 'thin', color: { rgb: this.colors.borderColor } },
        left: { style: 'thin', color: { rgb: this.colors.borderColor } },
        right: { style: 'thin', color: { rgb: this.colors.borderColor } }
      },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
    };
  }

  private static createSubHeaderStyle(): ExcelStyle {
    return {
      fill: { fgColor: { rgb: this.colors.subHeaderBg } },
      font: { name: 'Arial', sz: 11, color: { rgb: this.colors.subHeaderFont }, bold: true },
      border: {
        top: { style: 'thin', color: { rgb: this.colors.borderColor } },
        bottom: { style: 'thin', color: { rgb: this.colors.borderColor } },
        left: { style: 'thin', color: { rgb: this.colors.borderColor } },
        right: { style: 'thin', color: { rgb: this.colors.borderColor } }
      },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
    };
  }

  private static createEvenRowStyle(): ExcelStyle {
    return {
      fill: { fgColor: { rgb: this.colors.evenRowBg } },
      font: { name: 'Arial', sz: 10 },
      border: {
        top: { style: 'thin', color: { rgb: this.colors.borderColor } },
        bottom: { style: 'thin', color: { rgb: this.colors.borderColor } },
        left: { style: 'thin', color: { rgb: this.colors.borderColor } },
        right: { style: 'thin', color: { rgb: this.colors.borderColor } }
      },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
    };
  }

  private static createOddRowStyle(): ExcelStyle {
    return {
      fill: { fgColor: { rgb: this.colors.oddRowBg } },
      font: { name: 'Arial', sz: 10 },
      border: {
        top: { style: 'thin', color: { rgb: this.colors.borderColor } },
        bottom: { style: 'thin', color: { rgb: this.colors.borderColor } },
        left: { style: 'thin', color: { rgb: this.colors.borderColor } },
        right: { style: 'thin', color: { rgb: this.colors.borderColor } }
      },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
    };
  }

  private static createTotalsStyle(): ExcelStyle {
    return {
      fill: { fgColor: { rgb: this.colors.totalsBg } },
      font: { name: 'Arial', sz: 11, color: { rgb: this.colors.totalsFont }, bold: true },
      border: {
        top: { style: 'thin', color: { rgb: this.colors.borderColor } },
        bottom: { style: 'thin', color: { rgb: this.colors.borderColor } },
        left: { style: 'thin', color: { rgb: this.colors.borderColor } },
        right: { style: 'thin', color: { rgb: this.colors.borderColor } }
      },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
    };
  }

  private static applyTableStyles(ws: XLSX.WorkSheet, startRow: number, endRow: number, 
                                 startCol: string, endCol: string): void {
    const range = XLSX.utils.decode_range(`${startCol}${startRow}:${endCol}${endRow}`);
    
    if (!ws['!rows']) ws['!rows'] = [];
    
    for (let R = range.s.r; R <= range.e.r; R++) {
      // Set row height
      if (!ws['!rows'][R]) ws['!rows'][R] = {};
      ws['!rows'][R].hpt = 20; // Set height to 20 points
      
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;
        
        if (!ws[cellRef].s) ws[cellRef].s = {};
        
        // First row is header
        if (R === range.s.r) {
          ws[cellRef].s = this.createHeaderStyle();
        }
        // Even rows
        else if ((R - range.s.r) % 2 === 0) {
          ws[cellRef].s = this.createEvenRowStyle();
        }
        // Odd rows
        else {
          ws[cellRef].s = this.createOddRowStyle();
        }
      }
    }
  }

  static exportToExcel = (activityData: ActivityData): void => {
    // Create workbook with properties
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: `Relatório ${activityData.dashboard_info.title}`,
      Subject: "Relatório de Atividades",
      Author: "Sistema de Relatórios",
      CreatedDate: new Date()
    };

    // ===== SUMMARY SHEET =====
    const summaryData = [
      ['Relatório de Atividades:', activityData.dashboard_info.title],
      ['Data:', activityData.dashboard_info.date],
      ['Última atualização:', activityData.dashboard_info.last_update],
      [''],
      ['Empresa Executora:', activityData.companies.executing_company],
      ['Empresa Contratante:', activityData.companies.contracting_company],
      [''],
      ['Total de Atividades:', activityData.entries.length.toString()],
    ];

    // Calculate total time
    let totalMinutes = 0;
    activityData.entries.forEach(entry => {
      const [hours, minutes] = entry.tempo_gasto.split(':').map(Number);
      totalMinutes += (hours * 60) + minutes;
    });
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalTimeFormatted = `${totalHours}h ${remainingMinutes}min`;

    // Add total time to summary
    summaryData.push(['Tempo Total:', totalTimeFormatted]);

    // Count unique users
    const uniqueUsers = new Set(activityData.entries.map(e => e.responsavel)).size;
    summaryData.push(['Total de Responsáveis:', uniqueUsers.toString()]);

    // Calculate average time
    const avgMinutes = Math.round(totalMinutes / activityData.entries.length);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    const avgTimeFormatted = `${avgHours}h ${avgMins}min`;
    summaryData.push(['Tempo Médio por Atividade:', avgTimeFormatted]);

    // Create the summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths for summary
    const summaryColWidths = [
      { wch: 25 }, // Column A
      { wch: 50 }  // Column B
    ];
    summarySheet['!cols'] = summaryColWidths;

    // Style the summary sheet
    for (let i = 0; i < summaryData.length; i++) {
      // Skip empty rows
      if (summaryData[i].length === 0 || (summaryData[i].length === 1 && !summaryData[i][0])) continue;
      
      const cellA = `A${i+1}`;
      const cellB = `B${i+1}`;
      
      if (!summarySheet[cellA]) continue;
      if (!summarySheet[cellA].s) summarySheet[cellA].s = {};
      
      // Style header rows and data rows differently
      if (i === 0 || i === 4 || i === 7) {
        summarySheet[cellA].s = this.createSubHeaderStyle();
        if (summarySheet[cellB] && !summarySheet[cellB].s) summarySheet[cellB].s = {};
        summarySheet[cellB].s = this.createSubHeaderStyle();
      } else {
        summarySheet[cellA].s = {
          font: { name: 'Arial', sz: 11, bold: true },
          alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
        };
        
        if (summarySheet[cellB] && !summarySheet[cellB].s) summarySheet[cellB].s = {};
        summarySheet[cellB].s = {
          font: { name: 'Arial', sz: 11 },
          alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
        };
      }
    }

    // Add the summary sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // ===== ACTIVITIES SHEET =====
    const activitiesHeaders = [
      'Atividade',
      'Empresa',
      'Responsável',
      'Solicitante',
      'Data',
      'Tempo Gasto',
      'Descritivo'
    ];

    // Convert activities to array format
    const activitiesData = activityData.entries.map(entry => [
      entry.atividade,
      entry.empresa,
      entry.responsavel,
      entry.solicitante,
      formatDate(entry.data),
      entry.tempo_gasto,
      entry.descritivo
    ]);

    // Add headers to activities data
    activitiesData.unshift(activitiesHeaders);

    // Create the activities sheet
    const activitiesSheet = XLSX.utils.aoa_to_sheet(activitiesData);

    // Set column widths for activities
    const activitiesColWidths = [
      { wch: 40 }, // Atividade
      { wch: 15 }, // Empresa
      { wch: 15 }, // Responsável
      { wch: 15 }, // Solicitante
      { wch: 12 }, // Data
      { wch: 12 }, // Tempo Gasto
      { wch: 70 }  // Descritivo
    ];
    activitiesSheet['!cols'] = activitiesColWidths;

    // Apply table styling to the activities sheet
    this.applyTableStyles(
      activitiesSheet, 
      1, // Start row
      activitiesData.length, // End row
      'A', // Start column
      'G'  // End column
    );

    // Add the activities sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, activitiesSheet, 'Atividades');

    // ===== TIME BY PERSON SHEET =====
    const timeByPersonData: { [key: string]: number } = {};
    activityData.entries.forEach(entry => {
      const [hours, minutes] = entry.tempo_gasto.split(':').map(Number);
      const timeInMinutes = (hours * 60) + minutes;

      if (timeByPersonData[entry.responsavel]) {
        timeByPersonData[entry.responsavel] += timeInMinutes;
      } else {
        timeByPersonData[entry.responsavel] = timeInMinutes;
      }
    });

    // Convert to array format for Excel
    const timeByPersonArray = [['Responsável', 'Tempo Total (h:m)', 'Tempo Total (horas)', 'Porcentagem']];

    Object.entries(timeByPersonData).forEach(([person, minutes]) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const formattedTime = `${hours}:${mins.toString().padStart(2, '0')}`;
      const decimalHours = Math.round((hours + (mins / 60)) * 100) / 100;
      const percentage = Math.round((minutes / totalMinutes) * 1000) / 10;

      timeByPersonArray.push([
        person,
        formattedTime,
        decimalHours.toString(),
        `${percentage}%`
      ]);
    });

    // Add a total row
    timeByPersonArray.push([
      'TOTAL',
      `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`,
      Math.round((totalHours + (remainingMinutes / 60)) * 100) / 100 + '',
      '100%'
    ]);

    // Create the time by person sheet
    const timeByPersonSheet = XLSX.utils.aoa_to_sheet(timeByPersonArray);

    // Set column widths for time by person
    const timeByPersonColWidths = [
      { wch: 20 }, // Responsável
      { wch: 15 }, // Tempo Total (h:m)
      { wch: 15 }, // Tempo Total (horas)
      { wch: 15 }  // Porcentagem
    ];
    timeByPersonSheet['!cols'] = timeByPersonColWidths;

    // Apply table styling to the time by person sheet
    this.applyTableStyles(
      timeByPersonSheet,
      1, // Start row
      timeByPersonArray.length - 1, // End row (excluding total row)
      'A', // Start column
      'D'  // End column
    );

    // Style the total row
    const totalRowIndex = timeByPersonArray.length;
    for (let col = 0; col < 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: totalRowIndex - 1, c: col });
      if (!timeByPersonSheet[cellRef]) timeByPersonSheet[cellRef] = { v: '' };
      if (!timeByPersonSheet[cellRef].s) timeByPersonSheet[cellRef].s = {};
      timeByPersonSheet[cellRef].s = this.createTotalsStyle();
    }

    // Add the time by person sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, timeByPersonSheet, 'Tempo por Responsável');

    // Generate Excel file with styling
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true // Important for styles
    });
    
    const excelData = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Save the file with a clean filename
    const cleanTitle = activityData.dashboard_info.title
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, '_');    // Replace spaces with underscores
    
    const fileName = `Relatório_${cleanTitle}.xlsx`;
    saveAs(excelData, fileName);
  };

  // React component to trigger the export
  static ExportButton: React.FC<{ data: ActivityData; disabled?: boolean }> = ({ data, disabled = false }) => {
    const handleExport = () => {
      this.exportToExcel(data);
    };

    return (
      <ExportButton onClick={handleExport} disabled={disabled}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
        </svg>
        Exportar para Excel
      </ExportButton>
    );
  };
}

export default ExcelExport;