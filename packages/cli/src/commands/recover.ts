#!/usr/bin/env node

import logSymbols from "log-symbols"
import { clear } from "console"
import chalk from "chalk"
import { BigNumber, ethers } from "ethers"
import { PubKey } from "qaci-domainobjs"

import { connectToBlockchain, getNetworkExplorerUrl } from "../lib/blockchain.js"
import { QFI__factory } from "../../../contracts/typechain/factories/QFI__factory.js"
// import { VkRegistry__factory } from "../../../contracts/typechain/factories/VkRegistry__factory.js"

import { directoryExists, jsonToCsv, makeDir, writeLocalJsonFile } from "../lib/files.js"
import {
  coordinatorPubkey,
  deployedContracts,
  hacksFilePath,
  header,
  mnemonicBaseDirPath,
  mnemonicFilePath,
  outputDirPath,
  treeDepths,
  usersStateIndexesFilePath,
  userSignUps,
  maxValues,
  usersStateIndexesBaseDirPath
} from "../lib/constants.js"
import { askForConfirmation, customSpinner } from "../lib/prompts.js"


/**
 * Initialize command.
 * @param network <string> - the network where the contracts are going to be deployed.
 */
async function recover(network: string, maciIndex: string) {
  clear()

  console.log(header)

  try {
    // Check for output directory.
    if (!directoryExists(outputDirPath)) makeDir(outputDirPath)

    // Check if mnemonic already present.
    if (!directoryExists(mnemonicBaseDirPath) && !directoryExists(mnemonicFilePath))
      throw new Error(`You must first authenticate by running \`auth \"<your-mnemonic>\"\` command!`)
    // Check if users has been already signed up.
    if (!directoryExists(usersStateIndexesBaseDirPath)) makeDir(usersStateIndexesBaseDirPath)
    if (!directoryExists(usersStateIndexesBaseDirPath)) makeDir(usersStateIndexesBaseDirPath)
    // NOTE: contracts allready deployed.
    process.stdout.write(`\n`)

    const { provider, wallet } = await connectToBlockchain(network)
    const gasPrice = await provider.getGasPrice()
    const double = BigNumber.from("2")
    const doubleGasPrice = gasPrice.mul(double)

    /** INIT MACI/QFI SMART CONTRACTS */
    const deployer = wallet

    console.log(chalk.bold(`\n For all the marbles this will take approximately [43] minutes`))
    console.log(`\n${logSymbols.info} MAKE SURE YOU HAVE A STABLE WIFI CONNECTION AND YOUR LAPTOP IS CHARGED!\n`)
    const { confirmation: preFlightCheck1 } = await askForConfirmation("Ready?")

    if (!preFlightCheck1) {
      console.log(`\nFarewell 1👋`)
      process.exit(0)
    }

    const { confirmation: preFlightCheck2 } = await askForConfirmation("Are you ABOLUTELY SURE?", "yes", "no")

    if (!preFlightCheck2) {
      console.log(`\nFarewell 2👋`)
      process.exit(0)
    }

    const { confirmation: preFlightCheck3 } = await askForConfirmation("Do you have enough gas ?", "yes", "no")

    if (!preFlightCheck3) {
      console.log(`\nFarewell3 👋`)
      process.exit(0)
    }

    const { confirmation: preFlightCheck4 } = await askForConfirmation("LETS DO THE THING?", "I HAVE NO DOUBTS", "no")

    if (!preFlightCheck4) {
      console.log(`\nFarewell4 👋`)
      process.exit(0)
    }
    // Get deployed contracts instances.

    const qfi = new ethers.Contract(deployedContracts.QFI, QFI__factory.abi, deployer)

    // Send txs.
    let spinner = customSpinner(`SKIP: Set MACI instance for SimpleHackathon contract`, "point")
    spinner.start()

    spinner.stop()

    // NOTE: Set up vk registry

    spinner = customSpinner(`SKIP: Set VKs`, "point")
    spinner.start()

    console.log(`\n${logSymbols.info} SKIP: you are about to register [16] projects\n`)

    // Get CSV records.

    console.log(`\n${logSymbols.success} You have successfully registered the recipients on-chain 🎊\n`)

    console.log(
      `\n${logSymbols.success} You are about to register ballots, DO NOT EXIT RECOVERY FROM HERE IS HARD 🎊\n`
    )

    const stateIndexes = []

    const hacks: { [k: string]: string } = {}
    let j = Number(maciIndex)
    for await (const maciPK of userSignUps) {
      const spinner = customSpinner(`Sign up for user in position ${chalk.bold(j)}`, "point")
      spinner.start()

      // Prepare data for tx.
      const _maciPK = PubKey.unserialize(maciPK).asContractParam()
      const _signUpGatekeeperData = ethers.utils.defaultAbiCoder.encode(["uint256"], [0])
      const _initialVoiceCreditProxyData = ethers.utils.defaultAbiCoder.encode(["uint256"], [0])

      const tx = await qfi.connect(deployer).signUp(_maciPK, _signUpGatekeeperData, _initialVoiceCreditProxyData, {
        gasPrice: doubleGasPrice,
        gasLimit: ethers.utils.hexlify(10000000)
      })
      await tx.wait()

      // Read the event from logs.
      // const iface = qfi.interface
      // const signUpEvent = iface.parseLog(logs[logs.length - 1])
      const stateIndex: string = j.toString()

      stateIndexes.push(stateIndex)

      spinner.stop()
      console.log(
        `${logSymbols.success} User #${chalk.bold(j)} (${chalk.bold(
          maciPK
        )}) has been successfully registered on-chain with a state index of ${stateIndex}`
      )

      // Store rows for CSV files.
      stateIndexes.push({
        maciPK,
        stateIndex
      })
      hacks[maciPK] = stateIndex
      j++
    }

    // Create CSV file.
    jsonToCsv(usersStateIndexesFilePath, [`maciPK`, `stateIndex`], stateIndexes)

    writeLocalJsonFile(hacksFilePath, JSON.parse(JSON.stringify(hacks)))

    console.log(`\n${logSymbols.success} You have successfully registered users on-chain 🎊\n`)

    console.log(`\n${logSymbols.success} We will now start the grant round. It will be active for [7] days. 🎊\n`)

    const SEVENDAYS = 60 * 60 * 24 * 7

    const _coordinatorPubkey = PubKey.unserialize(coordinatorPubkey).asContractParam()
    const grantRoundTx = await qfi
      .connect(deployer)
      .deployGrantRound(SEVENDAYS, maxValues, treeDepths, _coordinatorPubkey, deployer.address, {
        gasPrice: doubleGasPrice,
        gasLimit: ethers.utils.hexlify(30000000)
      })

    await grantRoundTx.wait()

    console.log(`\n${logSymbols.success} You have successfully initialized the deployed MACI/QFI smart contracts 🎊\n`)
    console.log(
      `\n${logSymbols.success} you grant round will be active once this transaction is confirmed ${grantRoundTx} n`
    )
  } catch (err: any) {
    console.log(err)
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

export default recover
