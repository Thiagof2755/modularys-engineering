
// src/styles/
import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${theme.fonts.primary};
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
    line-height: 1.6;}
    
    h1, h2, h3, h4, h5, h6 {
      font-family: ${theme.fonts.heading};
      font-weight: 600;
      margin-bottom: 0.5em;
    }
    
    a {
      text-decoration: none;
      color: ${theme.colors.secondary};
    }
    
    button {
      cursor: pointer;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
  `