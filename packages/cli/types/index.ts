import { ethers } from "ethers"

export type EthKeyPair = {
  privateKey: string
  publicKey: string
  address: string
  mnemonic: string
}

export type KeyPair = {
  privateKey: string
  publicKey: string
}

export enum QRCodeFileType {
  PNG = "png",
  SVG = "svg",
  UTF8 = "utf8"
}

export type UserConnectedToNetwork = {
  provider: ethers.providers.JsonRpcProvider
  wallet: ethers.Wallet
}

export type Network = {
  name: string
  rpcUrl: string
  chainId: number
}

export type Recipient = {
  projectName: string
  tagline: string
  description: string
  ethereumAddress: string
  website: string
  bannerImageLink: string
  thumbnailImageLink: string
  logoCdnUrl: string
}

export type UserSignupData = {
  ethereumAddress: string
  maciPK: string
}
