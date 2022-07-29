#!/usr/bin/env node
import logSymbols from "log-symbols"
import clear from "clear"
import chalk from "chalk"
import { cleanDir, directoryExists, jsonToCsv, writeFileSync } from "../lib/files.js"
import { EthKeyPair, KeyPair, QRCodeFileType } from "../../types/index.js"
import { generateEthereumKeyPair, generateMaciKeyPair } from "../lib/keypair.js"
import toQRCodeFile from "../lib/qrcode.js"
import {
  baseAddressFileName,
  baseMnemonicFileName,
  basePkFileName,
  baseSkFileName,
  ethBaseAddressDirPath,
  ethBaseAddressQrPngDirPath,
  ethBaseAddressQrSvgDirPath,
  ethBaseAddressTxtDirPath,
  ethBaseCsvFilePath,
  ethBaseDirPath,
  ethBaseMnemonicDirPath,
  ethBaseMnemonicQrPngDirPath,
  ethBaseMnemonicQrSvgDirPath,
  ethBaseMnemonicTxtDirPath,
  ethBasePkDirPath,
  ethBasePkQrPngDirPath,
  ethBasePkQrSvgDirPath,
  ethBasePkTxtDirPath,
  ethBaseSkDirPath,
  ethBaseSkQrPngDirPath,
  ethBaseSkQrSvgDirPath,
  ethBaseSkTxtDirPath,
  generatedKeysGlobalDirPath,
  header,
  maciBaseCsvFilePath,
  maciPkBaseCsvFilePath,
  maciBaseDirPath,
  maciBasePkDirPath,
  maciBasePkQrPngDirPath,
  maciBasePkQrSvgDirPath,
  maciBasePkTxtDirPath,
  maciBaseSkDirPath,
  maciBaseSkQrPngDirPath,
  maciBaseSkQrSvgDirPath,
  maciBaseSkTxtDirPath,
  outputDirPath
} from "../lib/constants.js"
import { askForConfirmation } from "../lib/prompts.js"
const prepareDirectories = () => {
  // Globals.
  cleanDir(generatedKeysGlobalDirPath)
  cleanDir(ethBaseDirPath)
  cleanDir(maciBaseDirPath)

  /** ETH */

  // Root.
  cleanDir(ethBasePkDirPath)
  cleanDir(ethBaseSkDirPath)
  cleanDir(ethBaseAddressDirPath)
  cleanDir(ethBaseMnemonicDirPath)

  // Txt.
  cleanDir(ethBasePkTxtDirPath)
  cleanDir(ethBaseSkTxtDirPath)
  cleanDir(ethBaseAddressQrPngDirPath)
  cleanDir(ethBaseMnemonicTxtDirPath)

  // QR Png.
  cleanDir(ethBasePkQrPngDirPath)
  cleanDir(ethBaseSkQrPngDirPath)
  cleanDir(ethBaseAddressTxtDirPath)
  cleanDir(ethBaseMnemonicQrPngDirPath)

  // QR Svg.
  cleanDir(ethBasePkQrSvgDirPath)
  cleanDir(ethBaseSkQrSvgDirPath)
  cleanDir(ethBaseAddressQrSvgDirPath)
  cleanDir(ethBaseMnemonicQrSvgDirPath)

  /** MACI */

  // Root.
  cleanDir(maciBasePkDirPath)
  cleanDir(maciBaseSkDirPath)

  // Txt.
  cleanDir(maciBasePkTxtDirPath)
  cleanDir(maciBaseSkTxtDirPath)

  // QR Png.
  cleanDir(maciBasePkQrPngDirPath)
  cleanDir(maciBaseSkQrPngDirPath)

  // QR Svg.
  cleanDir(maciBasePkQrSvgDirPath)
  cleanDir(maciBaseSkQrSvgDirPath)
}

/**
 * Genkeys command.
 * @param amount <number> - amount of MACI and ETH keypairs to be generated.
 */
async function genkeys(amount: number) {
  clear()

  console.log(header)

  try {
    if (amount === 0) throw new Error(`Sorry, but you cannot generate zero key pairs for MACI/QFI`)

    // Check for output directory.
    if (!directoryExists(outputDirPath)) cleanDir(outputDirPath)
    else if (directoryExists(ethBaseDirPath) && directoryExists(maciBaseDirPath)) {
      // Prompt for user.
      console.log(`\n${logSymbols.info} Seems that you have already generated the keys!\n`)

      const { confirmation } = await askForConfirmation(
        "Are you sure you want to continue? (nb. confirmation will override your generated keys)",
        "yes",
        "no"
      )

      if (!confirmation) {
        console.log(`\nFarewell 👋`)
        process.exit(0)
      }
    }

    // Cleaning directories.
    prepareDirectories()

    console.log(chalk.bold(`\nEthereum and MACI Key generation is running`))

    const mnemonics = []
    const maciSks = []
    const maciPks = []

    for (let i = 0; i < amount; i += 1) {
      // Generate an Ethereum keypair.
      const ethKeyPair: EthKeyPair = generateEthereumKeyPair()

      // Generate a MACI keypair.
      let maciKeyPair: KeyPair = generateMaciKeyPair()
      let validKey = maciKeyPair.privateKey.length === 71
      while (!validKey) {
        maciKeyPair = generateMaciKeyPair()
        const ok = maciKeyPair.privateKey.length === 71
        validKey = ok
      }

      /* Files */
      const ethMnemonicFile = `${baseMnemonicFileName}_${i}`
      const ethAddressFile = `${baseAddressFileName}_${i}`
      const skFile = `${baseSkFileName}_${i}`
      const pkFile = `${basePkFileName}_${i}`

      /* Store as plaintext */

      // ETH.
      writeFileSync(`${ethBaseMnemonicTxtDirPath}/${ethMnemonicFile}.txt`, ethKeyPair.mnemonic)
      writeFileSync(`${ethBaseAddressTxtDirPath}/${ethAddressFile}.txt`, ethKeyPair.address)
      writeFileSync(`${ethBaseSkTxtDirPath}/${skFile}.txt`, ethKeyPair.privateKey)
      writeFileSync(`${ethBasePkTxtDirPath}/${pkFile}.txt`, ethKeyPair.publicKey)

      // MACI.
      writeFileSync(`${maciBaseSkTxtDirPath}/${skFile}.txt`, maciKeyPair.privateKey)
      writeFileSync(`${maciBasePkTxtDirPath}/${pkFile}.txt`, maciKeyPair.publicKey)

      /* Store as QR Code */

      // ETH.
      await toQRCodeFile(`${ethBaseMnemonicQrPngDirPath}/${ethMnemonicFile}`, ethKeyPair.mnemonic, QRCodeFileType.PNG)
      await toQRCodeFile(`${ethBaseMnemonicQrSvgDirPath}/${ethMnemonicFile}`, ethKeyPair.mnemonic, QRCodeFileType.SVG)

      await toQRCodeFile(`${ethBaseAddressQrPngDirPath}/${ethAddressFile}`, ethKeyPair.address, QRCodeFileType.PNG)
      await toQRCodeFile(`${ethBaseAddressQrSvgDirPath}/${ethAddressFile}`, ethKeyPair.address, QRCodeFileType.SVG)

      await toQRCodeFile(`${ethBaseSkQrPngDirPath}/${skFile}`, ethKeyPair.privateKey, QRCodeFileType.PNG)
      await toQRCodeFile(`${ethBaseSkQrSvgDirPath}/${skFile}`, ethKeyPair.privateKey, QRCodeFileType.SVG)

      await toQRCodeFile(`${ethBasePkQrPngDirPath}/${pkFile}`, ethKeyPair.publicKey, QRCodeFileType.PNG)
      await toQRCodeFile(`${ethBasePkQrSvgDirPath}/${pkFile}`, ethKeyPair.publicKey, QRCodeFileType.SVG)

      // MACI.
      await toQRCodeFile(`${maciBaseSkQrPngDirPath}/${skFile}`, maciKeyPair.privateKey, QRCodeFileType.PNG)
      await toQRCodeFile(`${maciBaseSkQrSvgDirPath}/${skFile}`, maciKeyPair.privateKey, QRCodeFileType.SVG)

      await toQRCodeFile(`${maciBasePkQrPngDirPath}/${pkFile}`, maciKeyPair.publicKey, QRCodeFileType.PNG)
      await toQRCodeFile(`${maciBasePkQrSvgDirPath}/${pkFile}`, maciKeyPair.publicKey, QRCodeFileType.SVG)

      // Store rows for CSV files.
      mnemonics.push({ mnemonic: ethKeyPair.mnemonic })
      maciSks.push({ maci_sk: maciKeyPair.privateKey })
      maciPks.push({ maci_pk: maciKeyPair.publicKey })

      console.log(`Keypair #${i} - ${logSymbols.success} Ethereum / ${logSymbols.success} MACI`)
    }

    // Create CSV files.
    jsonToCsv(ethBaseCsvFilePath, [`mnemonic`], mnemonics)
    jsonToCsv(maciBaseCsvFilePath, [`maci_sk`], maciSks)
    jsonToCsv(maciPkBaseCsvFilePath, [`maci_pk`], maciPks)

    console.log(
      `\n${logSymbols.info} Generated keypairs for Ethereum in the ${ethBaseDirPath} folder\n${logSymbols.info} Generated keypairs for MACI in the ${maciBaseDirPath} folder
       \n${logSymbols.success} You have successfully generated the keypairs for Ethereum and MACI 🎊`
    )
  } catch (err: any) {
    console.log(`\n${logSymbols.error} Something went wrong: ${err.message ?? err}`)
  }
}

export default genkeys
