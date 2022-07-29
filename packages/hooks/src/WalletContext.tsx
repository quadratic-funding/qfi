import { SafeAppWeb3Modal } from "@gnosis.pm/safe-apps-web3modal";
import { providers } from "ethers";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ICoreOptions } from "web3modal";
import { JsonRpcProvider, Resolver, getDefaultProvider } from "@ethersproject/providers";
import { IProviderOptions } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

import { switchChainOnMetaMask } from "./metamask";

type WalletContextType = {
  provider: providers.Web3Provider | null | undefined;
  chainId: string | null | undefined;
  address: string | null | undefined;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  isMetamask: boolean;
  networks: NetworkConfig;
  switchNetwork: (chainId: string) => void;
};

export const SUPPORTED_NETWORKS: NetworkConfig = {
  "0x1": {
    chainId: "0x1",
    name: "Mainnet",
    symbol: "ETH",
    explorer: "https://etherscan.io",
    rpc: "https://mainnet.infura.io/v3/<your infura project id>",
  },
  "0x64": {
    chainId: "0x64",
    name: "Gnosis Chain",
    symbol: "Gnosis Chain",
    explorer: "https://blockscout.com/Gnosis Chain/mainnet/",
    rpc: "https://rpc.gnosischain.com/",
  },
  "0x89": {
    chainId: "0x89",
    name: "Polygon Mainnet",
    symbol: "MATIC",
    explorer: "https://polygonscan.com/",
    rpc: "https://polygon-mainnet.g.alchemy.com/v2/7afvptVsZxjFBz8Mcdm4dpu84IekOGds",
  },
  "0x539": {
    chainId: "0x539",
    name: "Hardhat",
    symbol: "ETH",
    explorer: "http://localhost:1234",
    rpc: "http://localhost:8545",
  },
  "0x13881": {
    chainId: "0x13881",
    name: "Mumbai Testnet",
    symbol: "MATIC",
    explorer: "https://mumbai.polygonscan.com",
    rpc: "https://matic-mumbai.chainstacklabs.com",
  },
};

export const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      rpc: {
        1: SUPPORTED_NETWORKS["0x1"].rpc,
        100: SUPPORTED_NETWORKS["0x64"].rpc,
        1337: SUPPORTED_NETWORKS["0x539"].rpc,
      },
    },
  },
  walletlink: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "QFI",
      infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      rpc: {
        1: SUPPORTED_NETWORKS["0x1"].rpc,
        100: SUPPORTED_NETWORKS["0x64"].rpc,
        1337: SUPPORTED_NETWORKS["0x539"].rpc,
      },
    },
  },
  // .. Other providers
};

const WalletContext = createContext<WalletContextType>({
  provider: null,
  chainId: null,
  address: null,
  connectWallet: async () => undefined,
  disconnect: () => undefined,
  isConnecting: true,
  isConnected: false,
  isMetamask: false,
  networks: {},
  switchNetwork: () => undefined,
});

type WalletStateType = {
  provider?: providers.Web3Provider | null;
  chainId?: string | null;
  address?: string | null;
};

export type NetworkConfig = {
  [chainId: string]: {
    chainId: string;
    name: string;
    symbol: string;
    explorer: string;
    rpc: string;
  };
};

const isMetamaskProvider = (provider: providers.Web3Provider | null | undefined) =>
  provider?.connection?.url === "metamask";

/**
 * @category Providers
 */
export const WalletProvider: React.FC<{
  web3modalOptions: Partial<ICoreOptions>;
  networks: NetworkConfig;
  defaultChainId?: string;

  handleAccountsChangedEvent?: (accounts: string[]) => void;
  handleChainChangedEvent?: (chainId: number) => void;
  handleConnectEvent?: (info: { chainId: number }) => void;
  handleDisconnectEvent?: (error: { code: number; message: string }) => void;
  handleErrorEvent?: (error: { code: string; message: string }) => void;
}> = ({
  children,
  web3modalOptions,
  networks,
  defaultChainId,
  handleAccountsChangedEvent,
  handleChainChangedEvent,
  handleConnectEvent,
  handleDisconnectEvent,
  handleErrorEvent,
}) => {
  const [{ provider, chainId, address }, setWalletState] = useState<WalletStateType>({});

  const isConnected: boolean = useMemo(() => !!provider && !!address && !!chainId, [provider, address, chainId]);

  const [isConnecting, setConnecting] = useState<boolean>(true);
  const isMetamask = useMemo(() => isMetamaskProvider(provider), [provider]);

  const getModal = () => {
    const modal = new SafeAppWeb3Modal(web3modalOptions);
    return modal;
  };

  const disconnect = async () => {
    const modal = getModal();
    modal.clearCachedProvider();
    setWalletState({});
  };

  const numberToHex = (number: number) => {
    return `0x${number.toString(16)}`;
  };

  const switchNetwork = async (_chainId: string | number) => {
    const chainId: string = typeof _chainId === "number" ? numberToHex(_chainId) : _chainId;
    if (!networks[chainId]) {
      throw new Error(`No network configuration for chainId: ${chainId}`);
    }
    if (!window.ethereum?.isMetaMask) {
      throw new Error("Switching chain is only supported in Metamask");
    }
    await switchChainOnMetaMask(networks, chainId);
  };

  const setWalletProvider = async (provider: any) => {
    const ethersProvider = new providers.Web3Provider(provider);
    let chainId: string = typeof provider.chainId === "number" ? numberToHex(provider.chainId) : provider.chainId;

    if (!networks[chainId]) {
      if (!defaultChainId) {
        handleErrorEvent &&
          handleErrorEvent({
            code: "UNSUPPORTED_NETWORK",
            message: `Network not supported, please switch to one of the supported networks`,
          });
        return;
      }

      const success = isMetamaskProvider(ethersProvider) && (await switchChainOnMetaMask(networks, defaultChainId));
      if (!success) {
        const error = {
          code: "UNSUPPORTED_NETWORK",
          message: `Network not supported, please switch to ${networks[defaultChainId].name}`,
        };
        handleErrorEvent && handleErrorEvent(error);
        return;
      }
      chainId = defaultChainId;
    }

    const signerAddress = await ethersProvider.getSigner().getAddress();
    setWalletState({
      provider: ethersProvider,
      chainId,
      address: signerAddress,
    });
  };

  const connectWallet = async () => {
    try {
      setConnecting(true);
      const modal = getModal();
      const modalProvider = await modal.requestProvider();
      await setWalletProvider(modalProvider);

      const _isGnosisSafe = await modal.isSafeApp();

      if (!_isGnosisSafe) {
        modalProvider.on("accountsChanged", (accounts: string[]) => {
          disconnect();
          handleAccountsChangedEvent && handleAccountsChangedEvent(accounts);
        });
        modalProvider.on("chainChanged", (chainId: number) => {
          handleChainChangedEvent && handleChainChangedEvent(chainId);
          if (!networks[modalProvider.chainId]) {
            disconnect();
            handleErrorEvent &&
              handleErrorEvent({
                code: "UNSUPPORTED_NETWORK",
                message: `You have switched to an unsupported chain, Disconnecting from Metamask...`,
              });
          }
          modalProvider.on("connect", (info: { chainId: number }) => {
            handleConnectEvent && handleConnectEvent(info);
          });
          modalProvider.on("disconnect", (error: { code: number; message: string }) => {
            handleDisconnectEvent && handleDisconnectEvent(error);
          });
          // update wallet provider once the chain is changed
          setWalletProvider(modalProvider);
        });
      }
    } catch (web3Error) {
      // eslint-disable-next-line no-console
      console.error(web3Error);
      disconnect();
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      /**
       * Only try to connect when metamask is unlocked.
       * This prevents unnecessary popup on page load.
       */
      const isMetamaskUnlocked = (await window.ethereum?._metamask?.isUnlocked()) ?? false;
      const modal = getModal();
      const _isGnosisSafe = await modal.isSafeApp();

      if (isMetamaskUnlocked && (_isGnosisSafe || web3modalOptions.cacheProvider)) {
        await connectWallet();
      } else {
        setConnecting(false);
      }
    };
    load();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        provider,
        address,
        chainId,
        connectWallet,
        isConnected,
        isConnecting,
        disconnect,
        isMetamask,
        networks,
        switchNetwork,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export const formatAddress = (address: string | null | undefined, ensName?: string | null, chars = 5): string => {
  if (ensName) return ensName;
  else if (address) return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
  else return "";
};

export const useENS = ({
  ens,
  address,
}: {
  ens?: string;
  address?: string;
}): {
  ens?: string;
  address?: string;
  resolver?: Resolver;
  avatar?: string;
  getAddress: (ens: string) => Promise<string | undefined>;
  getEns: (address: string) => Promise<string | undefined>;
  loading: boolean;
} => {
  const [localENS, setLocalENS] = useState<string>();
  const [localAddress, setLocalAddress] = useState<string>();
  const [avatar, setAvatar] = useState<string>();
  const [resolver, setResolver] = useState<Resolver>();
  const [loading, setLoading] = useState(false);

  const { isConnected } = useWallet();
  const localProvider = getDefaultProvider();

  const populateENS = async () => {
    if (!localProvider) return;

    try {
      setLoading(true);
      if (ens) {
        const resolver = await (localProvider as JsonRpcProvider).getResolver(ens);
        const address = resolver?.address;
        const avatar = await resolver?.getAvatar();
        setLocalENS(ens);
        setLocalAddress(address);
        setAvatar(avatar?.url);
        setResolver(resolver as Resolver);
        return;
      }
      if (address) {
        const ens = await (localProvider as JsonRpcProvider).lookupAddress(address);
        const resolver = await (localProvider as JsonRpcProvider).getResolver(ens ?? "");
        const avatar = await resolver?.getAvatar();
        setLocalENS(ens ?? undefined);
        setLocalAddress(address);
        setAvatar(avatar?.url);
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    populateENS();
  }, [isConnected]);

  const getAddress = async (ens: string) => {
    const resolver = await (localProvider as JsonRpcProvider).getResolver(ens);
    const address = resolver?.address;
    return address;
  };

  const getEns = async (address: string) => {
    const ens = await (localProvider as JsonRpcProvider).lookupAddress(address);
    return ens ?? undefined;
  };

  return {
    ens: localENS,
    address: localAddress,
    avatar,
    resolver,
    getAddress,
    getEns,
    loading,
  };
};

/**
 * Gets the wallet context from the wallet provider
 * @category Hooks
 */
export const useWallet = (): WalletContextType => useContext(WalletContext);

export const nameToChainId = (name: string): string | undefined => {
  switch (name) {
    case "Gnosis Chain":
      return "0x64";
    case "polygon":
      return "0x89";
    case "Mainnet":
      return "0x1";
    case "Hardhat":
      return "0x539";
    case "Polygon":
      return "0x89";
    case "Mumbai Testnet":
      return "0x13881";
    default:
      return undefined;
  }
};

export type IWeb3modalOptions = {
  cacheProvider: boolean;
  providerOptions: IProviderOptions;
  theme: string;
};
export const web3modalOptions = {
  cacheProvider: true,
  providerOptions,
  theme: "dark",
};

// MIT License

// Copyright (c) 2022 Raid Guild

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
