import { useCallback, useMemo } from "react";
import { Text, VStack, Button, Show, Image, useColorModeValue } from "@chakra-ui/react";
import BeatLoader from "react-spinners/BeatLoader";
import CircleLoader from "react-spinners/CircleLoader";
import { formatAddress, useWallet, useENS } from "@qfi/hooks";
import { ButtonProps } from "@chakra-ui/react";

type MagikButtonProps = ButtonProps & {};

export const MagikButton: React.FC<MagikButtonProps> = ({ children, ...props }) => {
  const { connectWallet, isConnecting, isConnected, disconnect, address } = useWallet();
  const { avatar, loading } = useENS({ address: address ?? undefined });
  // const { avatar, loading } = useENS({ ens: "alisha.eth" ?? "" });

  const logoutBg = useColorModeValue(`red.400`, `red.400`);
  const loginBg = useColorModeValue(`#73FFBC`, `#37FFCF`);
  const switchBgHoverColor = isConnected ? logoutBg : loginBg;
  const logoutColor = useColorModeValue(`white`, `white`);
  const loginColor = useColorModeValue(`white`, `white`);
  const switchTextHoverColor = isConnected ? logoutColor : loginColor;
  const switchHeight = isConnected ? [14, 14, 14, 16] : [12, 12, 12, 14];

  const switchIconColor = useColorModeValue("black", "white");
  const BaseIcon = loading ? <CircleLoader size={25} color={switchIconColor} /> : <></>;
  const SwitchAvatar = avatar ? (
    <Image p={1} rounded={"full"} src={avatar} h={12} />
  ) : (
    <Image src="/metamask.png" h={9} p={1.5} mx={0.5} />
  );
  const SwitchIcon = isConnected && !loading ? SwitchAvatar : BaseIcon;

  const switchAction = isConnected ? disconnect : connectWallet;

  return (
      <Button
        fontWeight="bold"
        {...props}
        w="full"
        onClick={() => !isConnecting && switchAction()}
        h={switchHeight}
        pl={2}
        pr={8}
        borderRadius={"full"}
        leftIcon={SwitchIcon}
        variant="magik"
        disabled={isConnecting}
        _hover={{
          bg: switchBgHoverColor,
          color: switchTextHoverColor,
        }}>
        {isConnected ? <Web3State /> : <ConnectState />}
      </Button>
  );
};
function Web3State() {
  const switchColor = useColorModeValue("black", "white");
  const { address } = useWallet();
  const { ens, loading } = useENS({ address: address ?? undefined });
  // const { ens, loading } = useENS({ ens: "alisha.eth" ?? "" });
  const randomPlaceHolder = useCallback(() => {
    const rand = Math.floor(Math.random() * 6) + 2;
    switch (rand) {
      case 2:
        return `(¬､¬)`;
      case 3:
        return `(;¬_¬)`;
      case 6:
        return `눈_눈`;
      case 7:
        return `(╯°Д°)╯︵/(.□ . \\)`;
      default:
        return `(¬､¬)`;
    }
  }, []);
  const BaseName = useMemo(() => {
    return ens ? (
      <Text fontSize="sm" fontWeight="bold">
        {ens}
      </Text>
    ) : (
      <Text fontSize="sm" fontWeight="bold">
        {randomPlaceHolder()}
      </Text>
    );
  }, [ens, randomPlaceHolder]);

  const SwitchName = loading ? <BeatLoader size={8} color={switchColor} /> : BaseName;

  return (
    <VStack spacing={0.5} alignItems={"flex-start"}>
      {SwitchName}
      {ens}
      <Text fontSize="xs">{formatAddress(address)}</Text>
    </VStack>
  );
}
function ConnectState() {
  return (
    <VStack spacing={0.5} alignItems={"flex-start"} pl={3}>
      <Text fontSize="lg" fontWeight={"extrabold"} >
        CONNECT
      </Text>
    </VStack>
  );
}

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
