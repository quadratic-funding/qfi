#!/usr/bin/env node

import logSymbols from "log-symbols"
import { clear } from "console"
import chalk from "chalk"
import { Recipient } from "types/index.js"
import { ethers } from "ethers"
import { connectToBlockchain, getNetworkExplorerUrl } from "../lib/blockchain.js"
import { directoryExists, getCSVFileRecords, makeDir, readJSONFile } from "../lib/files.js"
import {
  deployedContractsBaseDirPath,
  deployedContractsFilePath,
  header,
  mnemonicBaseDirPath,
  mnemonicFilePath,
  outputDirPath
} from "../lib/constants.js"
import { SimpleHackathon__factory } from "../../../contracts/typechain/factories/SimpleHackathon__factory.js"
import { customSpinner } from "../lib/prompts.js"

/**
 * Throw an error if at least one recipient field value is not provided or malformed.
 * @param recipientRecord <Recipient>
 * @param index <number>
 */
const checkForMissingRecipientProperties = (recipientRecord: Recipient, index: number) => {
  const {
    projectName,
    tagline,
    description,
    ethereumAddress,
    website,
    bannerImageLink,
    thumbnailImageLink,
    logoCdnUrl
  } = recipientRecord

  if (!projectName) throw new Error(`Missing \`projectName\` property for the recipient (Row #${index})`)

  if (!tagline) throw new Error(`Missing \`tagline\` property for the recipient (Row #${index})`)

  if (!description) throw new Error(`Missing \`description\` property for the recipient (Row #${index})`)

  if (!website) throw new Error(`Missing \`website\` property for the recipient (Row #${index})`)

  if (!ethereumAddress) throw new Error(`Missing \`ethereumAddress\` property for the recipient (Row #${index})`)

  if (ethereumAddress.length !== 42 || !ethereumAddress.startsWith("0x"))
    throw new Error(`Malformed \`ethereumAddress\` property for the recipient (Row #${index})`)

  if (!bannerImageLink) throw new Error(`Missing \`bannerImageLink\` property for the recipient (Row #${index})`)

  if (!thumbnailImageLink) throw new Error(`Missing \`thumbnailImageLink\` property for the recipient (Row #${index})`)

  if (!logoCdnUrl) throw new Error(`Missing \`logoCdnUrl\` property for the recipient (Row #${index})`)
}

/**
 * Register recipients command.
 * @param network <string> - the network where the contracts are going to be deployed.
 * @param path <string> - the path of the CSV input file where the recipients data is stored.
 */
async function addRecipients(network: string, path: string) {
  clear()

  console.log(header)

  try {
    // Check for output directory.
    if (!directoryExists(outputDirPath)) makeDir(outputDirPath)

    // Check if mnemonic already present.
    if (!directoryExists(mnemonicBaseDirPath) && !directoryExists(mnemonicFilePath))
      throw new Error(`You must first authenticate by running \`auth \"<your-mnemonic>\"\` command!`)

    // Check if contracts has been already deployed.
    if (!directoryExists(deployedContractsBaseDirPath) && !directoryExists(deployedContractsFilePath))
      throw new Error(`You must first deploy QFI/MACI smart contracts by running \`deploy \"<network>\"\` command!`)

    process.stdout.write(`\n`)

    const { provider, wallet } = await connectToBlockchain(network)
    const deployer = wallet
    /** DEPLOY MACI/QFI SMART CONTRACTS */

    // Retrieve deployed smart contracts addresses.
    const deployedContracts = readJSONFile(deployedContractsFilePath)

    console.log(chalk.bold(`\nRecipients registration is running!`))

    // Get CSV records.
    const jsonRecipientsRecords: Array<Recipient> = await getCSVFileRecords(path)

    let i = 0
    for await (const recipientRecord of jsonRecipientsRecords) {
      const spinner = customSpinner(`Adding recipient in position ${chalk.bold(i)}`, "point")
      spinner.start()

      // Check input data.
      checkForMissingRecipientProperties(recipientRecord, i)

      // Get deployed simpleHackathon instance.
      const simpleHackathon = new ethers.Contract(
        deployedContracts.SimpleHackathon,
        SimpleHackathon__factory.abi,
        deployer
      )

      // Create metadata.
      const { ethereumAddress, ...metadataJSON } = recipientRecord
      const metadata = JSON.stringify(metadataJSON)

      // Create tx.
      const tx = await simpleHackathon.connect(deployer).addRecipient(recipientRecord.ethereumAddress, metadata, {
        gasPrice: await provider.getGasPrice(),
        gasLimit: ethers.utils.hexlify(10000000)
      })
      await tx.wait()

      spinner.stop()
      console.log(
        `${logSymbols.success} Recipient #${chalk.bold(i)} (${chalk.bold(
          recipientRecord.projectName
        )}) has been successfully registered on-chain`
      )

      i += 1
    }

    console.log(`\n${logSymbols.success} You have successfully registered the recipients on-chain 🎊\n`)
  } catch (err: any) {
    if (!err.transactionHash) console.log(`\n${logSymbols.error} Something went wrong: ${err}`)
    else
      console.log(
        `\n${logSymbols.error} Something went wrong with the transaction! More info here: ${chalk.bold(
          `${getNetworkExplorerUrl(network)}tx/${err.transactionHash}`
        )}`
      )
    process.exit(0)
  }
}

export default addRecipients
