import React from "react";
import { ChakraProvider, Text, useDisclosure } from "@chakra-ui/react";
import { theme, Fonts } from "@qfi/ui";
import { Route, Routes } from "react-router-dom";

import { HowItWorks } from "./pages/HowItWorks";
import { Admin } from "./pages/Admin";
import { Project } from "./pages/Project";
import { Projects } from "./pages/Projects";
import { Ballot } from "./pages/Ballot";
import { Home } from "./pages/Home";
import { Layout } from "./pages/Layout";
import { Begin } from "./pages/Begin";

export const App = () => {
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isGuideOpen, onOpen: onGuideOpen, onClose: onGuideClose } = useDisclosure();
  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              isSettingsOpen={isSettingsOpen}
              onSettingsOpen={onSettingsOpen}
              onSettingsClose={onSettingsClose}
              onGuideOpen={onGuideOpen}
              onGuideClose={onGuideClose}
              isGuideOpen={isGuideOpen}
            />
          }>
          <Route
            index
            element={
              <Home
                isSettingsOpen={isSettingsOpen}
                onSettingsOpen={onSettingsOpen}
                onGuideOpen={onGuideOpen}
                isGuideOpen={isGuideOpen}
              />
            }
          />
          <Route path="ballot" element={<Ballot />} />
          <Route path="projects" element={<Projects />}></Route>
          <Route path="projects/:projectId" element={<Project />} />
          <Route path="howitworks" element={<HowItWorks />} />
          <Route path="admin" element={<Admin />} />
          <Route
            path="begin"
            element={
              <Begin
                isSettingsOpen={isSettingsOpen}
                onSettingsOpen={onSettingsOpen}
                onGuideOpen={onGuideOpen}
                isGuideOpen={isGuideOpen}
              />
            }
          />
          <Route path="*" element={<Text> 404 </Text>} />
        </Route>
      </Routes>
    </ChakraProvider>
  );
};
