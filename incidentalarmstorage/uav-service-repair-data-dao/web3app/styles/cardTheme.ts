import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const variants = {
  outline: definePartsStyle({
    container: {
      boxShadow: "none",
    },
  }),
  elevated: definePartsStyle({
    container: {
      boxShadow: "lg",
      bg: "rgba(255, 255, 255, 0.55)",
    },
  }),
};

const sizes = {
  md: definePartsStyle({
    container: {
      borderRadius: "lg",
    },
  }),
};

export const cardTheme = defineMultiStyleConfig({ variants, sizes });
