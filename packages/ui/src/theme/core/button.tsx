import { theme as base } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
const Button = {
  ...base.components.Button,
  // 1. Update the base styles
  baseStyle: {
    fontWeight: "medium", // Normally, it's "semibold"
    _hover: { scale: "1.05", bg: "background.50" },
  },
  // 2. Add a new button size or extend existing
  sizes: {},
  // 3. Add a new visual variant
  variants: {
    primary: {
      color: "white",
      bg: "primary.400",
      _hover: { bg: "primary.500" },
    },
    barcelona: {
      height: "50px",
      color: "white",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      background: "rgb(53, 75, 55) none repeat scroll 0% 0%",
      fontFamily: 'NeuePixelGrotesk',
      fontWeight: "700",
      _hover: {   transition: "all 0s", transform: "rotate(-6.41deg)",  color: "white", scale: "1" },
      transform: "rotate(6.41deg)",
      width: "122px",
    },
    sideNav: {
      bg: "transparent",
      color: "whiteAlpha.900",
      borderRadius: "9999px",
      height: "56px",
      alignItems: "center",
      justifyContent: "flex-start",
      _hover: { bg: "transparent", color: "secondary.500", scale: "1" },
      _active: {
        boxShadow: "none",
        borderColor: "transparent",
        outline: "none",
        backgroundColor: "white",
      },
      _focus: {
        boxShadow: "none",
        borderColor: "transparent",
        outline: "none",
      },
    },
    magik: (props: any) => ({
      ...base.components.Button.variants.solid(props),
      bg: mode(`gray.100`, `whiteAlpha.200`)(props),
      color: mode(`gray.800`, `whiteAlpha.900`)(props),
    }),
    // 4. Override existing variants
    outline: (props: any) => ({
      ...base.components.Button.variants.outline(props),
      bg: "transparent",
      _active: { bg: "inherit" },
    }),
  },
};

export default Button;
