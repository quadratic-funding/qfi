import { Network, UserConnectedToNetwork } from "types"
import { JsonRpcProvider } from "@ethersproject/providers"
import { ethers, Wallet } from "ethers"
import chalk from "chalk"
import logSymbols from "log-symbols"
import { readFileSync } from "./files.js"
import { mnemonicFilePath, networks } from "./constants.js"

/**
 * Return the explorer associated to the given network.
 * @param networkName <string>
 * @returns <string>
 */
export const getNetworkExplorerUrl = (networkName: string): string => {
  if (networkName === networks.xdai.name) return networks.xdai.explorer
  if (networkName === networks.arbitrumRinkeby.name) return networks.arbitrumRinkeby.explorer
  if (networkName === networks.kovan.name) return networks.kovan.explorer
  if (networkName === networks.matic.name) return networks.matic.explorer
  return networks.localhost.explorer
}

/**
 * Return a new JSON RPC provider object linked to the provided network.
 * @param network <string> - the provided network.
 * @return <JsonRpcProvider>
 */
export const getProvider = (network: string): JsonRpcProvider => {
  let selectedNetwork: Network
  

  // Connect to selected network.
  if (network === networks.xdai.name) selectedNetwork = networks.xdai
  else if (network === networks.arbitrumRinkeby.name) selectedNetwork = networks.arbitrumRinkeby
  else if (network === networks.kovan.name) selectedNetwork = networks.kovan
  else if (network === networks.matic.name) selectedNetwork = networks.matic
  else selectedNetwork = networks.localhost
  const provider = new JsonRpcProvider(selectedNetwork.rpcUrl, selectedNetwork.name)

  return provider
}

/**
 * Return the related wallet associated to the given mnemonic.
 * @param mnemonic <string> - the secret mnemonic phrase (e.g., 12 words) separated by spaces.
 * @returns <Wallet>
 */
export const getWalletFromMnemonic = (mnemonic: string): Wallet => Wallet.fromMnemonic(mnemonic)

/**
 * Return a new Wallet instance obtained from mnemonic connected to the given provider.
 * @param provider <JsonRpcProvider> - the provider connected to the selected network
 * @returns <Wallet>
 */
export const connectWalletToProviderFromMnemonic = (provider: JsonRpcProvider): Wallet => {
  // Get wallet from stored mnemonic.
  const mnemonic = readFileSync(mnemonicFilePath)

  let wallet = Wallet.fromMnemonic(mnemonic)

  // Connect to the provider.
  wallet = wallet.connect(provider)

  return wallet
}

/**
 * Connect a user to the given blockchain network and return the provider and connected wallet.
 * @param network <string> - the blockchain network where the user wants to connect.
 * @returns <Promise<UserConnectedToNetwork>>
 */
export const connectToBlockchain = async (network: string): Promise<UserConnectedToNetwork> => {
  // Get the provider.
  const provider = getProvider(network)
  console.log(`${logSymbols.success} Connected to ${chalk.bold(provider.network.name)} network`)

  // Connect wallet to provider from mnemonic.
  const wallet = connectWalletToProviderFromMnemonic(provider)
  const balanceInEthers = ethers.utils.formatEther((await wallet.getBalance()).toString())

  console.log(
    `${logSymbols.info} Ethereum address: ${chalk.bold(wallet.address)} - Balance: ${chalk.bold(
      ethers.constants.EtherSymbol
    )}${chalk.bold(balanceInEthers)}`
  )

  return {
    provider,
    wallet
  }
}
