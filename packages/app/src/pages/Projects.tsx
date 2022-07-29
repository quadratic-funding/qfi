import React from "react";
import {
  VStack,
  Container,
  HStack,
  Flex,
  Image,
  AspectRatio,
  Tooltip,
  Text,
  Heading,
  Box,
  UnorderedList,
  ListItem,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import { getProjects, getShuffledProjects } from "../data";
import { Option } from "../propTypes";

const shortenEthAddress = (address: string) => {
  return address.substring(0, 6) + "..." + address.substring(address.length - 4);
};

export const Projects = () => {
  const fontColor = useColorModeValue("gray.800", "gray.200");
  const color = useColorModeValue("gray.800", "gray.700");
  let [searchParams] = useSearchParams();
  return (
    <>
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
          <Container
            h="full"
            w="full"
            maxWidth={{ base: "container.sm", md: "container.sm", lg: "container.md" }}
            px={0}
            pt={20}>
            <VStack mt={10} spacing={4} h="full" alignItems="flex-start">
              <VStack pl={4} spacing={0} alignItems={"flex-start"} w="full">
                <Heading fontSize={"5xl"} mb={0} fontWeight="">
                  Project Directory
                </Heading>

                <Accordion fontSize="xs" allowToggle>
                  <AccordionItem border="none">
                    <VStack>
                      <Text px={0} textAlign={"left"} as={AccordionButton} fontSize="xs">
                        This is a directory of projects! This page will be updated once the event starts to let you add
                        projects to a real ballot and vote for projects that you meet at the event. Tap here to learn
                        more 📖🧐.
                        <AccordionIcon></AccordionIcon>
                      </Text>
                    </VStack>
                    <AccordionPanel pb={4}>
                      <UnorderedList marginInlineStart={"1rem !important"} fontSize="xs" w="full">
                        <ListItem>
                          When a voter is whitelisted they receive a{" "}
                          <Tooltip label="pseudo-randomly assigned" placement="top">
                            <b>MACI passphrase</b>
                          </Tooltip>{" "}
                          and voice credits.
                        </ListItem>
                        <ListItem>
                          Everyone will begin with 99 <b>voice credits</b>
                        </ListItem>
                        <ListItem>
                          These<b> voice credits </b> are used to cast <b>votes</b> for projects on your ballot
                        </ListItem>
                        <ListItem>
                          You can add up to <b>8 projects</b> to your ballot and distribute your voice credits between
                          them. Choose wisely.
                        </ListItem>

                        <ListItem>
                          Casting a vote for a project will{" "}
                          <b>cost the square of the number of votes you want to cast</b> in voice credits. For example,
                          if you would like to cast 5 votes for Project A, that will cost 25 voice credits.
                        </ListItem>
                        <ListItem>
                          {" "}
                          You <b>cannot use more voice credits than you have</b>. Since each voter starts with 99 voice
                          credits, a vote of 10 (which would cost 100 voice credits) is more than any voter can afford
                          to pay. This means that at most, a single voter can give 9 votes to a single project - at a
                          cost of 81 voice credits - and have 18 voice credits left to vote for other projects.{" "}
                        </ListItem>
                        <ListItem>
                          {" "}
                          You <b>can submit many ballots</b> during the voting period.{" "}
                        </ListItem>

                        <ListItem>
                          Only the <b>final submitted ballot will be counted</b> toward the final tally. Trust no one.
                        </ListItem>
                        <ListItem>
                          The ballot will be tallied at the end of the voting period, and the{" "}
                          <b>prize pool will be distributed between all the projects</b> based on the number of votes
                          received during the event (via quadratic funding).
                        </ListItem>
                      </UnorderedList>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
              <VStack spacing={0} alignItems={"flex-start"} w="full">
                {getShuffledProjects().map((project: Option) => (
                  <Box
                    _hover={{
                      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
                      backgroundColor: "gray.100",
                    }}
                    alignItems={"stretch"}
                    as={Link}
                    to={`/projects/${project.id}?${searchParams.toString()}`}
                    color={fontColor}
                    key={project.id}
                    pt={3}
                    pb={3}
                    pl={4}
                    minH={"100px"}
                    w={"full"}>
                    <HStack spacing={0} alignItems="flex-start" w="full">
                      <AspectRatio
                        borderColor={"grey.800"}
                        borderWidth={1}
                        zIndex="1"
                        w={{ base: "50px", md: "50px" }}
                        rounded="full"
                        ratio={1}
                        mt={1}>
                        <Image borderRadius="full" src={project.logo} alt={project.name} />
                      </AspectRatio>
                      <VStack alignItems="flex-start" w="full" spacing={1.5} px={{ base: "4", md: "3" }}>
                        <VStack alignItems="flex-start" w="full" spacing={0}>
                          <Heading my={0.5} fontSize={"lg"} lineHeight={"24px"} fontWeight="700">
                            {project.name}
                          </Heading>
                          <Text
                            color={"gray.600"}
                            fontSize={"sm"}
                            lineHeight={"14px"}
                            fontWeight="400"
                            overflow={"clip"}>
                            {shortenEthAddress(project.address)}
                          </Text>
                        </VStack>
                        <Text fontSize={"sm"} lineHeight={"16px"} fontWeight="400">
                          {project.tagline}
                        </Text>
                        {/* <Text fontSize={"sm"} lineHeight={"16px"} fontWeight="400">
           
          </Text> */}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Container>
        </VStack>
      </Flex>

      <Outlet />
    </>
  );
};
