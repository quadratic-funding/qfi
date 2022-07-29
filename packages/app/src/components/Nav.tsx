import * as React from "react";
import { Text, Stack, HStack, Button } from "@chakra-ui/react";
import { MagikButton, Logo } from "@qfi/ui";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const Nav = () => {
  return (
    <Stack
      direction={{ base: "row", md: "row" }}
      justifyContent="space-between"
      alignItems={{ base: "center", md: "center" }}
      w="full">
      <HStack alignItems={"center"} spacing={[1, 2, 2]}>
       
        <Text
          position="relative"
          letterSpacing={["-2px", "-2px", "-1.5px"]}
          fontWeight="bold"
          fontSize={[28, 32, 32]}
          textAlign="center">
          
        </Text>
      </HStack>
      <HStack alignItems={"center"} spacing={[1, 2]}>
        <ColorModeSwitcher />
        <MagikButton />
      </HStack>
    </Stack>
  );
};

export default Nav;
