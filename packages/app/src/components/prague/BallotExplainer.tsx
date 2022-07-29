import React from "react";
import {
  VStack,
  Tooltip,
  Text,
  UnorderedList,
  ListItem,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";

export const BallotExplainer = () => {
  return (
    <Accordion fontSize="xs" allowToggle>
      <AccordionItem border="none">
        <VStack>
          <Text px={0} textAlign={"left"} as={AccordionButton} fontSize="xs">
            On this screen you can add votes to each project in your ballot. Each time you click the button it will add another vote to your project. Feel free to experiment with the votes you want to give, then you submit once you are happy with the ballot! 
            <AccordionIcon></AccordionIcon>
          </Text>
        </VStack>
        <AccordionPanel pb={4}>
          <UnorderedList marginInlineStart={"1rem !important"} fontSize="xs" w="full">
            <ListItem>
              This page will be updated once the event starts to let you vote for projects you meet at the event.
            </ListItem>
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
              You can add up to <b>8 projects</b> to your ballot and distribute your voice credits between them. Choose
              wisely.
            </ListItem>

            <ListItem>
              Casting a vote for a project will <b>cost the square of the number of votes you want to cast</b> in voice
              credits. For example, if you would like to cast 5 votes for Project A, that will cost 25 voice credits.
            </ListItem>
            <ListItem>
              {" "}
              You <b>cannot use more voice credits than you have</b>. Since each voter starts with 99 voice credits, a
              vote of 10 (which would cost 100 voice credits) is more than any voter can afford to pay. This means that
              at most, a single voter can give 9 votes to a single project - at a cost of 81 voice credits - and have 18
              voice credits left to vote for other projects.{" "}
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
              <b>prize pool will be distributed between all the projects</b> based on the number of votes received
              during the event (via quadratic funding).
            </ListItem>
          </UnorderedList>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
