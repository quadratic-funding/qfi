import { Wallet, utils } from "ethers"
import { Keypair as MaciKeyPair } from "qaci-domainobjs"
import { EthKeyPair, KeyPair } from "../../types/index.js"

/**
 * Generate a new Ethereum keypair.
 * @returns <KeyPair>
 */
export const generateEthereumKeyPair = (): EthKeyPair => {
  // Generate a new Ethereum wallet.
  const wallet = Wallet.fromMnemonic(utils.entropyToMnemonic(utils.randomBytes(32)))

  // Extract keys and mnemonic.
  const { address, privateKey, publicKey } = wallet
  const mnemonic = wallet.mnemonic.phrase

  return {
    address,
    mnemonic,
    privateKey,
    publicKey
  }
}

/**
 * Generate a new MACI keypair.
 * @returns <KeyPair>
 */
export const generateMaciKeyPair = (): KeyPair => {
  // Generate a new Ethereum wallet.
  const wallet = new MaciKeyPair()

  // Extract keys.
  const privateKey = wallet.privKey.serialize()
  const publicKey = wallet.pubKey.serialize()

  return {
    privateKey,
    publicKey
  }
}
