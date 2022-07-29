import React from "react";
import {
  VStack,
  Container,
  Flex,
  Text,
  Heading,
  Button,
  useColorModeValue,
  Link,
  Box,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
} from "@chakra-ui/react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { animateText, MagikText } from "@qfi/ui";
import { Hero } from "../components/Hero";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import { RecipientGuide } from "../components/prague/RecipientGuide";

export type HomeProps = {
  isSettingsOpen: boolean;
  onSettingsOpen: () => void;
  isGuideOpen: boolean;
  onGuideOpen: () => void;
};

export const Home = ({ isSettingsOpen, onSettingsOpen, isGuideOpen, onGuideOpen }: HomeProps) => {
  const color = useColorModeValue("gray.800", "gray.700");
  const backgroundColor = useColorModeValue("#FAFAFA", "gray.700");
  let [searchParams] = useSearchParams();
  return (
    <Flex
      as="main"
      h="full"
      flex={1}
      borderRightColor={color}
      borderRightWidth={1}
      position={"relative"}
      overflow="hidden">
      {/* <Hero
        position={"absolute"}
        overflow="hidden"
        zIndex={-1}
        maxW={"1600px"}
        left={{ base: "-260px", md: "0px", lg: "0px", xl: "-80px" }}
        top={{ base: "100px", md: "0px", lg: "0px", xl: "160px" }}
      /> */}

      <Container
        h="full"
        w="full"
        overflowY={"scroll"}
        right="-24px"
        top={0}
        left={0}
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
        }}
        maxWidth={{ lg: "container.lg", md: "container.md" }}
        py={8}>
        {/* <VStack spacing={0} w="full" alignItems={"flex-end"}>
          <ColorModeSwitcher position="absolute" top={0} right={0} m={4} zIndex={1} />
        </VStack> */}
        <VStack mt={20} spacing={10} h="full" alignItems="flex-start">
          <VStack spacing={6} alignItems="flex-start">
            <Heading fontFamily={"NeuePixelGrotesk"} fontSize={{ base: "76px", xl: "120px" }}>
              平方募資法
            </Heading>
            <Text fontSize={"sm"} maxW="60ch">
            Quadratic Funding
            </Text>
            <Text fontSize={"sm"} maxW="60ch">
在 Web3 的世界中，我們透過社群自治來解決各式問題。

而平方投票法，則是一套消弭分配不均的實驗性工具。
            </Text>
            <HStack justifyContent={"space-around"} spacing={10}>
              <Box
                sx={{
                  height: "50px",
                  boxSizing: "border-box",
                  color: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",
                  border: "0.8px solid rgb(53, 75, 55)",
                  transition: "all 0s linear",
                  _hover: { transform: "rotate(6.41deg)", scale: "1" },

                  transform: "rotate(-6.41deg)",
                  width: "122px",
                }}>
                <Button as={RouterLink} variant={"barcelona"} fontSize={{ base: "lg", xl: "xl" }}  to={`/begin?${searchParams.toString()}`} 
                          >
                  我是團隊
                </Button>
              </Box>

              <Text as={RouterLink} color={"gray.700"} to={`/projects?${searchParams.toString()}`} fontFamily={"NeuePixelGrotesk"} fontWeight={"bold"} fontSize={{ base: "lg", xl: "xl" }}>
              我是觀眾
              </Text>
            </HStack>
          </VStack>
          <VStack w="full" spacing={6}>
          <VStack spacing={6} alignItems="flex-start" w={"full"}>
            <Accordion allowToggle w={"full"} bg={backgroundColor} defaultIndex={0}>
              <AccordionItem border="none" w={"full"}>
                <HStack as={AccordionButton} w={"full"} justifyContent={"space-between"} py={4}>
                  <Heading textAlign={"left"} size="md">
                  跨界合作：總統盃黑客松
                  </Heading>
                  <AccordionIcon></AccordionIcon>
                </HStack>

                <AccordionPanel pb={4}>
                  <Text  fontSize="sm" py={2}>
                  平方投票法是套集體決策程序。參與決策的投票者透過分配投票來表達偏好及偏好的程度。藉此，平方投票試圖解決多數決的常見難題，如投票悖論、棄保效應及配票。為推廣平方投票法的優點，本協會響應總統盃黑客松解決台灣永續相關議題之目標，並支持優良新創項目得以永續發展，將於 N24 台北方舟區塊鏈創新育成基地舉辦平方募資活動。
                  </Text>
                
                  <Text  fontSize="sm"  py={2}>
                  「2022 總統盃黑客松」以國家發展藍圖為本，超越 GDP (Beyond GDP) 的發展理念，融入國、內外發展情勢，以『安居永續‧均衡臺灣』為競賽主題，從「安居樂業」(SDGs 社會面)、「永續發展」(SDGs 經濟面) 及「均衡臺灣」(SDGs 環境面) 三大面向，號召全民許願、黑客解題，希冀透過公私協力，共創經濟、社會及環境都具幸福感的安居臺灣。
                  </Text>
                  
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
          <VStack spacing={6} alignItems="flex-start" w={"full"}>
            <Accordion allowToggle w={"full"} bg={backgroundColor} >
              <AccordionItem border="none" w={"full"}>
                <HStack as={AccordionButton} w={"full"} justifyContent={"space-between"} py={4}>
                  <Heading size="md">
什麼是「平方募資法」？</Heading>
                  <AccordionIcon></AccordionIcon>
                </HStack>

                <AccordionPanel pb={4}>
                  <Text  fontSize="sm">
                  為避免因棄保效應、配票、80/20 法則等，導致非主流項目遭忽視與資源分配不均，以太坊創辦人 Vitalik Buterin、哈佛大學經濟學者 Zoë Hitzig 以及微軟首席經濟研究員 Glen Weyl 在 2018 年底共同提出「平方募資法」(Quadratic Funding)，平方募資基於平方投票計算與分配資金（如政府預算、慈善或企業來源、直接從參與者收集），目的在於讓資源分配變得更加平均。
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* <MagikButton /> */}
          </VStack>
          
          {/* <VStack spacing={6} alignItems="flex-start" w={"full"}>
            <Accordion allowToggle w={"full"} bg={backgroundColor}>
              <AccordionItem border="none" w={"full"}>
                <HStack as={AccordionButton} w={"full"} justifyContent={"space-between"} py={4}>
                  <Heading textAlign={"left"} size="md">
                   Eligibility Criteria
                  </Heading>
                  <AccordionIcon></AccordionIcon>
                </HStack>

                <AccordionPanel pb={4}>
                  <Text  fontSize="sm"  py={2}>
                    - Project needs to be based or working with local communities or the environment in Catalunya or elsewhere in Spain.
                  </Text>
                  <Text  fontSize="sm"  py={2}>
                  - Public good focused Web3 / impact DAOs / decentralized projects can also apply, this is not exclusive to any project regardless of their use of blockchain technologies.
                  </Text>
                  <Text  fontSize="sm"  py={2}>
                  - Projects are required to have a public good focus or impact, often defined as non-rivalrous (use by one person doesn’t prevent access by others) and non-excludable (anyone can access or use it).
                  </Text>
                  <Text  fontSize="sm"  py={2}>
                  - Public good can be one of the many impacts of the project but it must be explicit what you will use the funds for if you are granted them. For example: funding a free permaculture education course for children in a village in Catalunya.
                  </Text>
                  <Text  fontSize="sm"  py={2}>
                  - Projects are not required to be web3 or crypto-native, but they must submit a Gnosis Chain wallet which they control as part of the application process. We encourage the use of self-custody solutions.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack> */}
        </VStack>
          {/* <VStack spacing={6} h="full" pb={8} alignItems={{ base: "flex-start", xl: "center" }} display="contents">
            <MagikText
              fontFamily="NeuePixelGrotesk"
              fontWeight="400"
              text="Featured Projects"
              charPoses={animateText.bottomLeft(0)}
              mt={10}
              lineHeight={{ base: "100px", xl: "180px" }}
              fontSize={{ base: "65px", xl: "100px" }}
              textAlign={{ base: "left", xl: "center" }}
            />
            <Heading my={10} py={"40px"} fontFamily="NeuePixelGrotesk" fontWeight="400">
              {" "}
              Stay Tuned! Projects will be announced soon after applications close.
            </Heading>
          </VStack> */}
        </VStack>
      </Container>
    </Flex>
  );
};
