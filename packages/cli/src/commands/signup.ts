#!/usr/bin/env node

import logSymbols from "log-symbols"
import { clear } from "console"
import chalk from "chalk"
import { UserSignupData } from "types/index.js"
import { ethers } from "ethers"
import {  PubKey } from "qaci-domainobjs"
import { connectToBlockchain, getNetworkExplorerUrl } from "../lib/blockchain.js"
import {
  directoryExists,
  getCSVFileRecords,
  jsonToCsv,
  makeDir,
  readJSONFile,
  writeLocalJsonFile
} from "../lib/files.js"
import {
  deployedContractsBaseDirPath,
  deployedContractsFilePath,
  hacksFilePath,
  header,
  mnemonicBaseDirPath,
  mnemonicFilePath,
  outputDirPath,
  usersStateIndexesBaseDirPath,
  usersStateIndexesFilePath
} from "../lib/constants.js"
import { askForConfirmation, customSpinner } from "../lib/prompts.js"
import { QFI__factory } from "../../../contracts/typechain/factories/QFI__factory.js"

/**
 * Throw an error if at least one signup data field value is not provided or malformed.
 * @param userSignupData <UserSignupData>
 * @param index <number>
 */
const checkForMissingUserSignupDataProperties = (userSignupData: UserSignupData, index: number) => {
  const { ethereumAddress, maciPK } = userSignupData

  if (!ethereumAddress) throw new Error(`Missing \`ethereumAddress\` property for the recipient (Row #${index})`)

  if (ethereumAddress.length !== 42 || !ethereumAddress.startsWith("0x"))
    throw new Error(`Malformed \`ethereumAddress\` property for the recipient (Row #${index})`)

  if (!maciPK) throw new Error(`Missing \`maciPK\` property for the user signup data (Row #${index})`)

  // TODO: add more checks?
}

/**
 * signup users command.
 * @param network <string> - the network where the contracts are going to be deployed.
 * @param path <string> - the path of the CSV input file where the signup data is stored.
 */
async function signup(network: string, path: string) {
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

    // Check if users has been already signed up.
    if (!directoryExists(usersStateIndexesBaseDirPath)) makeDir(usersStateIndexesBaseDirPath)
    else {
      // Prompt for user.
      console.log(`\n${logSymbols.info} Seems that you have already done the signup!\n`)

      const { confirmation } = await askForConfirmation("Are you sure you want to continue?", "yes", "no")

      if (!confirmation) {
        console.log(`\nFarewell 👋`)
        process.exit(0)
      }
    }

    process.stdout.write(`\n`)

    const { wallet } = await connectToBlockchain(network)
    const deployer = wallet

    // Retrieve deployed smart contracts addresses.
    const deployedContracts = readJSONFile(deployedContractsFilePath)

    console.log(chalk.bold(`\nSignup is running!`))

    // Get CSV records.
    const jsonUsersSignupData: Array<UserSignupData> = await getCSVFileRecords(path)

    let i = 0
    const stateIndexes = []

    const hacks: { [k: string]: string } = {}

    // Get deployed qfi instance.
    const qfi = new ethers.Contract(deployedContracts.QFI, QFI__factory.abi, deployer)

    for await (const userSignupData of jsonUsersSignupData) {
      const spinner = customSpinner(`Sign up for user in position ${chalk.bold(i)}`, "point")
      spinner.start()

      // Check input data.
      checkForMissingUserSignupDataProperties(userSignupData, i)

      // Extract user data.
      const { ethereumAddress, maciPK } = userSignupData

      // Prepare data for tx.
      const _maciPK = PubKey.unserialize(maciPK).asContractParam()
      const _signUpGatekeeperData = ethers.utils.defaultAbiCoder.encode(["uint256"], [0])
      const _initialVoiceCreditProxyData = ethers.utils.defaultAbiCoder.encode(["uint256"], [0])

      // Create tx.
      const { logs } = await qfi
        .connect(deployer)
        .signUp(_maciPK, _signUpGatekeeperData, _initialVoiceCreditProxyData)
        .then((tx: any) => tx.wait())

      // Read the event from logs.
      const iface = qfi.interface
      const signUpEvent = iface.parseLog(logs[logs.length - 1])
      const stateIndex: string = signUpEvent.args._stateIndex.toString()

      stateIndexes.push(stateIndex)

      spinner.stop()
      console.log(
        `${logSymbols.success} User #${chalk.bold(i)} (${chalk.bold(
          ethereumAddress
        )}) has been successfully registered on-chain with a state index of ${stateIndex}`
      )

      // Store rows for CSV files.
      stateIndexes.push({
        ethereumAddress,
        maciPK,
        stateIndex
      })
      hacks[maciPK] = stateIndex

      i += 1
    }

    // Create CSV file.
    jsonToCsv(usersStateIndexesFilePath, [`ethereumAddress`, `maciPK`, `stateIndex`], stateIndexes)

    writeLocalJsonFile(hacksFilePath, JSON.parse(JSON.stringify(hacks)))

    console.log(`\n${logSymbols.success} You have successfully registered the users on-chain 🎊\n`)
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

export default signup
