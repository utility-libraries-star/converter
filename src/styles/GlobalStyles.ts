import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  body {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  #__next {
    flex: 1;
  }

  * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  }
`;

export default GlobalStyles;
