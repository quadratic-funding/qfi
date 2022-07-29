#!/usr/bin/env node

import logSymbols from "log-symbols"
import { clear } from "console"
import chalk from "chalk"
import { BigNumber, ethers } from "ethers"
import { connectToBlockchain, getNetworkExplorerUrl } from "../lib/blockchain.js"
import { PoseidonT3__factory } from "../../../contracts/typechain/factories/PoseidonT3__factory.js"
import { PoseidonT4__factory } from "../../../contracts/typechain/factories/PoseidonT4__factory.js"
import { PoseidonT5__factory } from "../../../contracts/typechain/factories/PoseidonT5__factory.js"
import { PoseidonT6__factory } from "../../../contracts/typechain/factories/PoseidonT6__factory.js"
import { GrantRoundFactory__factory } from "../../../contracts/typechain/factories/GrantRoundFactory__factory.js"
import { PollFactory__factory } from "../../../contracts/typechain/factories/PollFactory__factory.js"
import { MessageAqFactory__factory } from "../../../contracts/typechain/factories/MessageAqFactory__factory.js"
import { QFI__factory } from "../../../contracts/typechain/factories/QFI__factory.js"
import { VkRegistry__factory } from "../../../contracts/typechain/factories/VkRegistry__factory.js"
import { SimpleHackathon__factory } from "../../../contracts/typechain/factories/SimpleHackathon__factory.js"
import { BaseERC20Token__factory } from "../../../contracts/typechain/factories/BaseERC20Token__factory.js"
import { PollProcessorAndTallyer__factory } from "../../../contracts/typechain/factories/PollProcessorAndTallyer__factory.js"
import { MockVerifier__factory } from "../../../contracts/typechain/factories/MockVerifier__factory.js"
import { directoryExists, makeDir, writeLocalJsonFile } from "../lib/files.js"
import {
  baseERC20TokenInitialSupply,
  deployedContractsBaseDirPath,
  deployedContractsFilePath,
  header,
  initialVoiceCreditBalance,
  mnemonicBaseDirPath,
  mnemonicFilePath,
  outputDirPath
} from "../lib/constants.js"
import { askForConfirmation, customSpinner } from "../lib/prompts.js"

/**
 * Deploy command.
 * @param network <string> - the network where the contracts are going to be deployed.
 */
async function deploy(network: string) {
  clear()

  console.log(header)

  try {
    // Check for output directory.
    if (!directoryExists(outputDirPath)) makeDir(outputDirPath)

    // Check if mnemonic already present.
    if (!directoryExists(mnemonicBaseDirPath) && !directoryExists(mnemonicFilePath))
      throw new Error(`You must first authenticate by running \`auth \"<your-mnemonic>\"\` command!`)

    // Check if contracts has been already deployed.
    if (!directoryExists(deployedContractsBaseDirPath)) makeDir(deployedContractsBaseDirPath)
    else {
      // Prompt for user.
      console.log(`\n${logSymbols.info} Seems that you have already done the smart contracts deploy!\n`)

      const { confirmation } = await askForConfirmation(
        "Are you sure you want to continue? (nb. confirmation will NOT override your on-chain contracts but you will LOSE your local contracts reference)",
        "yes",
        "no"
      )

      if (!confirmation) {
        console.log(`\nFarewell 👋`)
        process.exit(0)
      }
    }

    process.stdout.write(`\n`)

    const { wallet, provider } = await connectToBlockchain(network)
    const gasPrice = await provider.getGasPrice()
    const doubleGasPrice = gasPrice.mul(BigNumber.from(2))
    const gasLimit = ethers.utils.hexlify(20000000)
    /** DEPLOY MACI/QFI SMART CONTRACTS */
    const deployer = wallet
    const deployerAddress = wallet.address

    console.log(chalk.bold(`\nDeploy for QFI/MACI smart contracts is running`))

    const PoseidonT3Factory = new PoseidonT3__factory(deployer)
    const PoseidonT4Factory = new PoseidonT4__factory(deployer)
    const PoseidonT5Factory = new PoseidonT5__factory(deployer)
    const PoseidonT6Factory = new PoseidonT6__factory(deployer)

    let spinner = customSpinner(`Deploying PoseidonT3 smart contract..`, "point")
    spinner.start()

    const PoseidonT3 = await PoseidonT3Factory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await PoseidonT3.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} PoseidonT3 deployed at ${chalk.bold(PoseidonT3.address)}`)

    spinner = customSpinner(`Deploying PoseidonT4 smart contract...`, "point")
    spinner.start()

    const PoseidonT4 = await PoseidonT4Factory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await PoseidonT4.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} PoseidonT4 deployed at ${chalk.bold(PoseidonT4.address)}`)

    spinner = customSpinner(`Deploying PoseidonT5 smart contract...`, "point")
    spinner.start()

    const PoseidonT5 = await PoseidonT5Factory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await PoseidonT5.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} PoseidonT5 deployed at ${chalk.bold(PoseidonT5.address)}`)

    spinner = customSpinner(`Deploying PoseidonT6 smart contract...`, "point")
    spinner.start()

    const PoseidonT6 = await PoseidonT6Factory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await PoseidonT6.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} PoseidonT6 deployed at ${chalk.bold(PoseidonT6.address)}`)

    const linkedLibraryAddresses = {
      "qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT5": PoseidonT5.address,
      "qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT3": PoseidonT3.address,
      "qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT6": PoseidonT6.address,
      "qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT4": PoseidonT4.address
    }

    const GrantRoundFactory = new GrantRoundFactory__factory({ ...linkedLibraryAddresses }, deployer)
    const PollFactoryFactory = new PollFactory__factory({ ...linkedLibraryAddresses }, deployer)
    const MessageAqFactoryFactory = new MessageAqFactory__factory({ ...linkedLibraryAddresses }, deployer)
    const QFIFactory = new QFI__factory({ ...linkedLibraryAddresses }, deployer)

    const VKRegistryFactory = new VkRegistry__factory(deployer)
    const BaseERC20TokenFactory = new BaseERC20Token__factory(deployer)
    const PollProcessorAndTallyerFactory = new PollProcessorAndTallyer__factory(deployer)
    const MockVerifierFactory = new MockVerifier__factory(deployer)
    const SimpleHackathonFactory = new SimpleHackathon__factory(deployer)

    spinner = customSpinner(`Deploying SimpleHackathon smart contract...`, "point")
    spinner.start()

    const simpleHackathon = await SimpleHackathonFactory.deploy(initialVoiceCreditBalance, deployerAddress, {
      gasPrice: doubleGasPrice,
      gasLimit
    })
    await simpleHackathon.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} SimpleHackathon deployed at ${chalk.bold(simpleHackathon.address)}`)

    spinner = customSpinner(`Deploying GrantRoundFactory smart contract...`, "point")
    spinner.start()

    const grantRoundFactory = await GrantRoundFactory.deploy({
      gasPrice: doubleGasPrice,
      gasLimit: ethers.utils.hexlify(20000000)
    })
    await grantRoundFactory.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} GrantRoundFactory deployed at ${chalk.bold(grantRoundFactory.address)}`)

    spinner = customSpinner(
      `Setting SimpleHackathon as recipient registry in GrantRoundFactory smart contract...`,
      "point"
    )
    spinner.start()

    const tx = await grantRoundFactory.setRecipientRegistry(simpleHackathon.address, {
      gasPrice: doubleGasPrice,
      gasLimit
    })
    await tx.wait()
    spinner.stop()

    console.log(`${logSymbols.success} GrantRoundFactory recipient registry correctly set!`)

    spinner = customSpinner(`Deploying PollFactory smart contract...`, "point")
    spinner.start()

    const pollFactory = await PollFactoryFactory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await pollFactory.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} PollFactory deployed at ${chalk.bold(pollFactory.address)}`)

    spinner = customSpinner(`Deploying MessageAqFactory smart contract...`, "point")
    spinner.start()

    const messageAqFactory = await MessageAqFactoryFactory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await messageAqFactory.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} MessageAqFactory deployed at ${chalk.bold(messageAqFactory.address)}`)

    spinner = customSpinner(`Deploying MessageAqFactoryGrants smart contract...`, "point")
    spinner.start()

    const messageAqFactoryGrants = await MessageAqFactoryFactory.deploy({ gasPrice: doubleGasPrice, gasLimit })
    await messageAqFactoryGrants.deployed()
    spinner.stop()

    console.log(
      `${logSymbols.success} MessageAqFactoryGrants deployed at ${chalk.bold(messageAqFactoryGrants.address)}`
    )

    spinner = customSpinner(`Deploying VKRegistry smart contract...`, "point")
    spinner.start()

    const vkRegistry = await VKRegistryFactory.deploy({ gasPrice: doubleGasPrice })
    await vkRegistry.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} VKRegistry deployed at ${chalk.bold(vkRegistry.address)}`)

    spinner = customSpinner(`Deploying BaseERC20Token smart contract...`, "point")
    spinner.start()

    const baseERC20Token = await BaseERC20TokenFactory.deploy(ethers.BigNumber.from(baseERC20TokenInitialSupply), {
      gasPrice: doubleGasPrice
    })
    await baseERC20Token.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} Barcelona Pool Token deployed at ${chalk.bold(baseERC20Token.address)}`)

    spinner = customSpinner(`Deploying MockVerifier smart contract...`, "point")
    spinner.start()

    const mockVerifier = await MockVerifierFactory.deploy({ gasPrice: doubleGasPrice })
    await mockVerifier.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} MockVerifier deployed at ${chalk.bold(mockVerifier.address)}`)

    spinner = customSpinner(`Deploying PollProcessorAndTallyer smart contract...`, "point")
    spinner.start()

    const pollProcessorAndTallyer = await PollProcessorAndTallyerFactory.deploy(mockVerifier.address, {
      gasPrice: doubleGasPrice,
      gasLimit
    })
    await pollProcessorAndTallyer.deployed()
    spinner.stop()

    console.log(
      `${logSymbols.success} PollProcessorAndTallyer deployed at ${chalk.bold(pollProcessorAndTallyer.address)}`
    )

    spinner = customSpinner(`Deploying QFI smart contract...`, "point")
    spinner.start()

    const qfi = await QFIFactory.deploy(
      baseERC20Token.address,
      grantRoundFactory.address,
      pollFactory.address,
      simpleHackathon.address,
      simpleHackathon.address,
      { gasPrice: doubleGasPrice, gasLimit }
    )
    await qfi.deployed()
    spinner.stop()

    console.log(`${logSymbols.success} QFI deployed at ${chalk.bold(qfi.address)}`)

    // Store addresses in a local JSON file.

    const contractsInJson = `{
      "PoseidonT3": \"${PoseidonT3.address}\",
      "PoseidonT4": \"${PoseidonT4.address}\",
      "PoseidonT5": \"${PoseidonT5.address}\",
      "PoseidonT6": \"${PoseidonT6.address}\",
      "GrantRoundFactory": \"${grantRoundFactory.address}\",
      "PollFactory": \"${pollFactory.address}\",
      "MessageAqFactory": \"${messageAqFactory.address}\",
      "MessageAqFactoryGrants": \"${messageAqFactoryGrants.address}\",
      "SimpleHackathon": \"${simpleHackathon.address}\",
      "VKRegistry": \"${vkRegistry.address}\",
      "BaseERC20Token": \"${baseERC20Token.address}\", 
      "MockVerifier": \"${mockVerifier.address}\", 
      "PollProcessorAndTallier": \"${pollProcessorAndTallyer.address}\", 
      "QFI": \"${qfi.address}\"
  }`

    writeLocalJsonFile(deployedContractsFilePath, JSON.parse(contractsInJson))

    console.log(
      `\n${logSymbols.info} You can find the deployed smart contracts addresses in the ${deployedContractsFilePath} file\n${logSymbols.success} You have successfully deployed the MACI/QFI smart contracts 🎊\n`
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

export default deploy
