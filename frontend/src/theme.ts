import { createTheme, Theme } from '@mui/material';

declare module '@mui/material/styles/createPalette' {
  interface SimplePaletteColorOptions {
    opaque?: string;
  }

  interface PaletteColor {
    opaque: string;
  }

  interface PaletteOptions {
    lend?: PaletteColorOptions;
    borrow?: PaletteColorOptions;
    backstop?: PaletteColorOptions;
    menu?: PaletteColorOptions;
    positive?: PaletteColorOptions;
    accent?: PaletteColorOptions;
    negative?: PaletteColorOptions;
  }

  interface Palette {
    lend: PaletteColor;
    borrow: PaletteColor;
    backstop: PaletteColor;
    menu: PaletteColor;
    positive: PaletteColor;
    accent: PaletteColor;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    lend: true;
    borrow: true;
    backstop: true;
    positive: true;
    accent: true;
    menu: false;
  }
}

const FONT: string = 'Inter, sans-serif';

const pxToRem = (px: number) => {
  const remVal = px / 16;
  return `${remVal.toFixed(3)}rem`;
};

const theme: Theme = createTheme({
  palette: {
    mode: 'dark',
    tonalOffset: 0,
    background: {
      default: 'rgb(24, 28, 36)',
      paper: 'rgb(25, 37, 49)',
    },
    primary: {
      main: '#C7F284',
      contrastText: 'rgb(22, 32, 43)',
      opaque: '#c7f284',
    },
    secondary: {
      main: '#00C4EF',
      opaque: '#ff336626',
    },
    lend: {
      main: '#00C4EF',
      opaque: '#00C4EF26',
    },
    borrow: {
      main: '#185180',
      opaque: '#ffffff',
    },
    backstop: {
      main: '#E16BFF',
      opaque: '#E16BFF26',
    },
    positive: {
      main: 'rgb(50, 223, 123)',
    },
    negative: {
      main: 'rgb(235, 87, 87)',
    },
    accent: {
      main: '#ffffff',
      opaque: '#191B1F',
    },
    menu: {
      main: '#2E3138',
      light: '#2E313893',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.5)',
    },
    warning: {
      main: '#fc1500',
      opaque: '#fc150026',
    },
    error: {
      main: '#FF3366',
      opaque: '#FF336626',
    },
  },
  typography: {
    fontFamily: FONT,
    h1: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: pxToRem(20),
      lineHeight: 1.6,
    },
    h2: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: pxToRem(18),
      lineHeight: 1.473,
    },
    h3: {
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: pxToRem(18),
      lineHeight: 1.473,
    },
    h4: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
    h5: {
      fontFamily: FONT,
      fontWeight: 400,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    body1: {
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
    body2: {
      fontFamily: FONT,
      fontWeight: 400,
      fontSize: pxToRem(14),
      lineHeight: 1.125,
    },
    button: {
      textTransform: 'none',
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 420, // marker for the mobile layout requirement
      md: 640,
      lg: 850, // marker for compact layout requirements
      xl: 1024,
    },
  },
});

export default theme;
