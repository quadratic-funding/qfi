import React from "react";
import { HStack, Flex, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { LayoutProps } from "../propTypes";
import { Navbar, SideNav } from "../components/prague/SideNav";
import { Quickstart } from "../components/prague/Quickstart";
import { RecipientGuide } from "../components/prague/RecipientGuide";
import { SettingsDrawer } from "../components/prague/Settings";
import { GuideDrawer } from "../components/prague/GuideDrawer";

export const Layout = ({
  isSettingsOpen,
  onSettingsOpen,
  onSettingsClose,
  onGuideOpen,
  onGuideClose,
  isGuideOpen,
}: LayoutProps) => {
  const backgroundColor = useColorModeValue("gray.100", "gray.700");
  return (
    <HStack h="100vh" w="full" spacing={0}>
      <Navbar onSettingsOpen={onSettingsOpen} onGuideOpen={onGuideOpen} ></Navbar>
      <Flex as="nav" h="full" maxW={16} w="full" bg={backgroundColor}>
        <SideNav onSettingsOpen={onSettingsOpen} onGuideOpen={onGuideOpen} />
      </Flex>
      <Flex
        as="aside"
        display={{ base: "none", xl: "none" }}
        h="full"
        maxW={{ lg: "md" }}
        w="full"
        position={"relative"}
        overflow={"hidden"}>
      
        <SettingsDrawer isOpen={isSettingsOpen} onClose={onSettingsClose} />
        <GuideDrawer isOpen={isGuideOpen} onClose={onGuideClose} />
      </Flex>
      <Outlet />
    </HStack>
  );
};
