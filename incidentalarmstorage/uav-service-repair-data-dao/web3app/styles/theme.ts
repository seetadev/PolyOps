import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

import { cardTheme } from "./cardTheme";

const theme = extendTheme(
  withDefaultColorScheme({
    colorScheme: "primary",
  }),
  {
    styles: {
      global: {
        "html, body": {
          minHeight: "100vh",
        },
      },
    },
    radii: {
      none: "0",
      sm: "0.25rem",
      base: "0.375rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      full: "9999px",
    },
    components: {
      Card: cardTheme,
    },
    colors: {
      primary: {
        "50": "#f7f7ff",
        "100": "#ddddff",
        "200": "#c0c0ff",
        "300": "#9b9cff",
        "400": "#8687ff",
        "500": "#5D5FEF",
        "600": "#5859d9",
        "700": "#4747af",
        "800": "#3c3c94",
        "900": "#2b2c6b",
      },
    },
  }
);

export default theme;
