import * as React from "react";
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import SplitText from "react-pose-text";
import { Text, TextProps } from "@chakra-ui/react";

type CharPoses = {
  exit: {
    opacity: number;
    y: number;
    x?: number;
  };
  enter: {
    transition: {
      duration: number;
      ease: string;
    };
    opacity: number;
    y: number;
    x?: number;
    delay: ({ wordIndex }: { wordIndex: any }) => number;
  };
};
const bottomLeft = (delay: number): CharPoses => {
  return {
    exit: { opacity: 0, y: 40, x: -50 },
    enter: {
      transition: { duration: 240, ease: "easeIn" },
      opacity: 1,
      x: 0,
      y: 0,
      delay: ({ wordIndex }) => 25 * (wordIndex + 3) ** 2 + delay,
    },
  };
};

const bottom = (delay: number): CharPoses => {
  return {
    exit: { opacity: 0, y: 40 },
    enter: {
      transition: { duration: 240, ease: "easeIn" },
      opacity: 1,
      y: 0,
      delay: ({ wordIndex }) => 30 * (wordIndex + 3) ** 2 + delay,
    },
  };
};

const fancy = (delay: number): CharPoses => {
  return {
    exit: { opacity: 0, y: 40 },
    enter: {
      transition: { duration: 100, ease: "easeIn" },
      opacity: 1,
      y: 0,
      delay: ({ wordIndex }) => (delay + 20.5 * (wordIndex + 70)) ^ (0.5 + (wordIndex + 50)) ^ 2,
    },
  };
};
export const animateText = {
  bottomLeft,
  bottom,
  fancy,
};

export type MagikTextProps = Omit<TextProps, "fontFamily"> &
  PropsWithChildren<{
    text: string;
    charPoses: CharPoses;
    fontFamily: "Futura" | "Helvetica" | "Arial" | "Dahlia" |"DahliaCondensed"| "sans-serif";
  }>;

export const MagikText: React.FC<MagikTextProps> = ({ children, charPoses, text, ...props }) => (
  <Text as={"div"} {...props}>
    <SplitText initialPose="exit" pose="enter" charPoses={charPoses}>
      {text}
    </SplitText>
  </Text>
);

export type GlitchTextProps = Omit<TextProps, "fontFamily"> &
  PropsWithChildren<{
    text: string;
    duration: number;
    delay: number;
  }>;

export const GlitchText = ({ children, text, duration, delay, ...props }: GlitchTextProps) => {
  return (
    <Text as={"div"} {...props}>
      <motion.div
        style={{
          zIndex: 1,
          position: "relative",

          textAlign: "center",
        }}
        animate={{
          opacity: [0, 1, 1, 1, 1, 0],
          bottom: [0, 5, 5, -5, -5, 0],
          right: [-5, 15, -15, 15, -15, 5],
          color: ["#9783EA", "#94BBFD", "#CCF6FF", "#D9D9BC"],
        }}
        transition={{
          type: "spring",
          damping: 10,
          mass: 0.75,
          stiffness: 100,
          duration,
          repeat: 2,
          delay,
        }}>
        {text}
      </motion.div>
    </Text>
  );
};
export default MagikText;


// MIT License

// Copyright (c) 2022 RadHaus

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.