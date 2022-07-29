import React, { useState } from "react";
import { Flex, useColorModeValue, Text, VStack, Container, Heading, Button } from "@chakra-ui/react";
import { QrReader } from "react-qr-reader";

// Simple enumerative for key types.
enum KeyType {
  ETH_PUBLICKEY = "Ethereum Public Key",
  ETH_PRIVATEKEY = "Ethereum Private Key",
  MACI_PUBLICKEY = "MACI Public Key",
  MACI_PRIVATEKEY = "MACI Private Key",
  INVALID_KEY = "Invalid Key"
}

export const Admin = () => {
  const color = useColorModeValue("gray.800", "gray.700");

  const [key, setKey] = useState<string>();
  const [keyType, setKeyType] = useState<string>();
  const [openQRCodeReader, setOpenQRCodeReader] = useState(false);
  const onClickSetOpenQRCodeReader = () => setOpenQRCodeReader(!openQRCodeReader)

  /**
   * Check and store the key type for a given key.
   * @param key <string> - the key to be checked
   * @returns <KeyType>
   */
  const checkAndStoreKeyType = (key: string): KeyType => {
    if (key.length === 132 && key.startsWith("0x"))
      return KeyType.ETH_PUBLICKEY
  
    if (key.length === 66 && key.startsWith("0x"))
      return KeyType.ETH_PRIVATEKEY
  
    if (key.length === 71 && key.startsWith("macipk."))
      return KeyType.MACI_PUBLICKEY
  
    if (key.length === 71 && key.startsWith("macisk."))
      return KeyType.MACI_PRIVATEKEY

    return KeyType.INVALID_KEY
  }
  
  return (
    <Flex
      as="main"
      h="full"
      flex={1}
      borderRightColor={color}
      borderRightWidth={1}
      overflowY={"scroll"}
      sx={{
        scrollbarColor: "green",
        "::-webkit-scrollbar": {
          width: "0px"
        },

        "::-webkit-scrollbar-track": {
          boxShadow: "inset 0 0 0px grey",
          borderRadius: "0px"
        },

        "::-webkit-scrollbar-thumb": {
          background: "transparent",
          borderRadius: "0px"
        }
      }}>

      <VStack spacing={0} w="full">
        <Container h="full" w="full" maxWidth="container.sm">
          <VStack mt={10} spacing={4} h="full" alignItems="flex-start">
            <Heading mb={4}>SIGNUP</Heading>

            <VStack w="full" display={{ base: "none", xl: "flex" }} pt="10" justifyContent={"center"}>
              <Button h="80px" w="full" background="#FFFF00" color={color} variant={"solid"} onClick={onClickSetOpenQRCodeReader}>
                <Text fontSize="xl" fontWeight={"black"} >
                  {" "}
                  Scan key QR Code{" "}
                </Text>
              </Button>
              {openQRCodeReader &&
                <Container h="full" w="full" maxWidth="container.sm">
                  <QrReader
                    onResult={(result: any, error: any) => {
                      if (!!result) {
                        const key = result.getText()
                        const keyType = checkAndStoreKeyType(key)

                        setKey(key);
                        setKeyType(keyType)
                      }

                      if (!!error) {
                        console.info(`Something went wrong while reading the QR Code: ${error}`);
                      }
                    }}
                    constraints={
                      { facingMode: 'user' }
                    } />
                </Container>
              }
              <Text fontSize="xl" fontWeight={"black"} >
                {keyType}
              </Text>
              <Text fontSize="sm" fontWeight={"black"} >
                {key}
              </Text>
              {!!key && !!keyType && (keyType === KeyType.MACI_PRIVATEKEY || keyType === KeyType.ETH_PRIVATEKEY) &&
                <Text>
                  Do something with {keyType} ...
                </Text>
              }
            </VStack>
          </VStack>
        </Container>
      </VStack>
    </Flex >
  );
};
