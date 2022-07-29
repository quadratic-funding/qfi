import { useEffect, useMemo, useState } from "react";
import {
  VStack,
  Container,
  Flex,
  Text,
  Heading,
  Button,
  Link,
  useColorModeValue,
  Divider,
  HStack,
  PinInput,
  PinInputField,
  Icon,
  useToast,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { MagikButton } from "@qfi/ui";
import { Keypair, PrivKey } from "qaci-domainobjs";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import { useDappState } from "../context/DappContext";
import { QrReader } from "react-qr-reader";
import { HiExternalLink } from "react-icons/hi";
import { getStateIndex } from "../quickBallotConfig";

export type HomeProps = {
  isSettingsOpen: boolean;
  onSettingsOpen: () => void;
  isGuideOpen: boolean;
  onGuideOpen: () => void;
};

const isMaciPrivKey = (key: string): boolean => {
  if ((key.length === 71 || key.length === 70) && key.startsWith("macisk.")) {
    try {
      const pubKey = new Keypair(PrivKey.unserialize(key)).pubKey.serialize();
      if (getStateIndex(pubKey)) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  return false;
};

export const Begin = ({ isSettingsOpen, onSettingsOpen, isGuideOpen, onGuideOpen }: HomeProps) => {
  const color = useColorModeValue("gray.800", "gray.700");
  const toast = useToast();
  const [key, setKey] = useState<string>();
  const numChars = useMemo(() => {
    if (key) {
      return key.length;
    }
  }, [key]);
  const [keyType, setKeyType] = useState<string>();
  const [openQRCodeReader, setOpenQRCodeReader] = useState(false);
  const onClickSetOpenQRCodeReader = () => setOpenQRCodeReader(!openQRCodeReader);

  const { maciKey, setMaciKey } = useDappState();

  const isError = useMemo(() => {
    return key && !isMaciPrivKey(key);
  }, [key]);

  useEffect(() => {
    if (maciKey) {
      setKey(maciKey);
    }
  }, [setKey, maciKey]);
  const handleChange = (value: string) => {
    setKey(value.trim);
  };

  const handleInputChange = (e) => {
    setKey(String(e.target.value).trim());
  };

  const handleComplete = (value: string) => {
    console.log("complete");
    try {
      if (isMaciPrivKey(value)) {
        setMaciKey(value);

        toast({
          title: "New Maci Key",
          description: "You have updated your MACI key, and are registered to vote.",
          status: "success",
          duration: 6000,
          isClosable: true,
        });
        console.log("changed");
        console.log(new Keypair(PrivKey.unserialize(value)).pubKey.serialize());
      } else {
        throw new Error("Invalid MACI key");
      }
    } catch (e) {
      toast({
        title: "Invalid Maci Key",
        description: "The MACI Key you have provided is either incorrect or not registered",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.log(e.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleComplete(key);
  };
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
          width: "0px",
        },

        "::-webkit-scrollbar-track": {
          boxShadow: "inset 0 0 0px grey",
          borderRadius: "0px",
        },

        "::-webkit-scrollbar-thumb": {
          background: "transparent",
          borderRadius: "0px",
        },
      }}>
      <VStack spacing={0} w="full">
        <Container h="full" w="full" maxWidth="container.sm">
          <VStack mt={10} spacing={4} h="full" alignItems="flex-start">
            <Container maxWidth={{ lg: "container.md", md: "container.md" }} py={100}>
              <VStack spacing={0} w="full" alignItems={"flex-end"}>
                <ColorModeSwitcher position="absolute" top={0} right={0} m={4} zIndex={1} />
              </VStack>
              <VStack spacing={2} h="full" alignItems={"flex-start"}>
                <VStack
                  spacing={6}
                  h="full"
                  pb={8}
                  alignItems={{ base: "flex-start", xl: "center" }}
                  display="contents"
                  mt={{ base: "80px", xl: "60px" }}>
                  <VStack spacing={6} alignItems="flex-start">
                    <Heading size="4xl">How it works?</Heading>
                    <Text >
                      Casting a Ballot requires you to have a wallet on Gnosis Chain Chain, xDai to pay for gas, and a valid
                      ballot key. Voting is anonymous.
                    </Text>
                  </VStack>
                  <VStack spacing={6} alignItems="flex-start">
                    <Heading size="md">Gnosis Chain (xDai) Wallet</Heading>
                    <Text >
                      To submit your votes you will receive your MACI private key to your email address (the one used when buying the ticket) sent by the ETHLatam team.
                    </Text>
                    <MagikButton />
                  </VStack>
                  <VStack spacing={2} alignItems="flex-start">
                    <Heading size="md">Ballot (MACI) passphrase</Heading>
                    <Text >
                       
                      Each voter gets a pseudo-random MACI key which is
                      used to encrypt and validate your votes. This is the only way to vote in the round, and can be
                      used to change your ballot at any time while the round is active, so keep it safe.
                    </Text>
                  </VStack>

                  {/* <VStack w="full" pt="10" justifyContent={"center"}>
                    <Button
                      h="80px"
                      w="full"
                      background="#FFFF00"
                      color={color}
                      variant={"solid"}
                      onClick={onClickSetOpenQRCodeReader}>
                      <Text fontSize="xl" fontWeight={"black"} >
                        {" "}
                        Scan key QR Code{" "}
                      </Text>
                    </Button>
                    {openQRCodeReader && (
                      <Container h="full" w="full" maxWidth="container.sm">
                        <QrReader
                          scanDelay={1000}
                          onResult={(result: any, error: any) => {
                            if (!!result) {
                              setMaciKey(result.text);
                              setKey(result.text);
                            }

                            if (!!error) {
                              console.info(`Something went wrong while reading the QR Code: ${error}`);
                            }
                          }}
                          constraints={{ facingMode: "environment" }}
                        />
                      </Container>
                    )}
                  </VStack> */}

                  <VStack spacing={1} alignItems="flex-start" w="full">
                    <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                      <FormControl w="full" isInvalid={isError} variant="floating" id="key" isRequired>
                        <Input w="full" type={"password"} placeholder="" value={key} onChange={handleInputChange} />
                        {/* It is important that the Label comes after the Control due to css selectors */}
                        <FormLabel>MACI SK</FormLabel>
                        <FormHelperText>{numChars}/71</FormHelperText>
                        <Button
                          fontSize="lg"
                          fontWeight={"black"}
                          bg={"black"}
                          color="white"
                          h="60px"
                          w="full"
                          background="#5400FF"
                          type="submit"
                          width="full"
                          mt={4}>
                          SAVE
                        </Button>
                      </FormControl>
                    </form>
                    {/* <HStack flexWrap="wrap" maxW="240px">
                      <PinInput
                        defaultValue="macisk."
                        size="xs"
                        type="alphanumeric"
                        value={key}
                        onChange={handleChange}
                        onComplete={handleComplete}>
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                        <PinInputField marginInlineStart={"0px !important"} />
                      </PinInput>
                    </HStack> */}

                    {/* <Divider></Divider> */}
                  </VStack>
                  <VStack spacing={2} alignItems="flex-start">
                    <Heading size="md">Confused or need help?</Heading>
                    <Text fontSize="md" >
                    You can send us an email at qf@ethlatam.com or join the ETHLatam Telegram group use the #QF hashtag in your post 
                      <Link href="https://t.me/ethlatam" isExternal>
                        <Icon as={HiExternalLink} boxSize={4} color="gray.500" />
                      </Link>
                    </Text>
                  
                  </VStack>
                </VStack>
              </VStack>
            </Container>
          </VStack>
        </Container>
      </VStack>
    </Flex>
  );
};
