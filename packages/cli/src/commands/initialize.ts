#!/usr/bin/env node

import logSymbols from "log-symbols"
import { clear } from "console"
import chalk from "chalk"
import { ethers } from "ethers"
import { connectToBlockchain, getNetworkExplorerUrl } from "../lib/blockchain.js"
import { GrantRoundFactory__factory } from "../../../contracts/typechain/factories/GrantRoundFactory__factory.js"
import { PollFactory__factory } from "../../../contracts/typechain/factories/PollFactory__factory.js"
import { MessageAqFactory__factory } from "../../../contracts/typechain/factories/MessageAqFactory__factory.js"
import { QFI__factory } from "../../../contracts/typechain/factories/QFI__factory.js"
import { SimpleHackathon__factory } from "../../../contracts/typechain/factories/SimpleHackathon__factory.js"
// import { VkRegistry__factory } from "../../../contracts/typechain/factories/VkRegistry__factory.js"

import { directoryExists, makeDir, readJSONFile } from "../lib/files.js"
import {
  deployedContractsBaseDirPath,
  deployedContractsFilePath,
  header,
  mnemonicBaseDirPath,
  mnemonicFilePath,
  numberOfMaxRecipients,
  outputDirPath
} from "../lib/constants.js"
import { customSpinner } from "../lib/prompts.js"

/**
 * Initialize command.
 * @param network <string> - the network where the contracts are going to be deployed.
 */
async function initialize(network: string) {
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
    const gasPrice = await provider.getGasPrice()
    const gasLimit = ethers.utils.hexlify(10000000)

    /** INIT MACI/QFI SMART CONTRACTS */
    const deployer = wallet

    // Retrieve deployed smart contracts addresses.
    const deployedContracts = readJSONFile(deployedContractsFilePath)

    console.log(chalk.bold(`\nInitialization for QFI/MACI smart contracts is running`))

    // Get deployed contracts instances.

    const simpleHackathon = new ethers.Contract(
      deployedContracts.SimpleHackathon,
      SimpleHackathon__factory.abi,
      deployer
    )

    const pollFactory = new ethers.Contract(deployedContracts.PollFactory, PollFactory__factory.abi, deployer)

    const grantRoundFactory = new ethers.Contract(
      deployedContracts.GrantRoundFactory,
      GrantRoundFactory__factory.abi,
      deployer
    )

    const messageAqFactory = new ethers.Contract(
      deployedContracts.MessageAqFactory,
      MessageAqFactory__factory.abi,
      deployer
    )

    const messageAqFactoryGrants = new ethers.Contract(
      deployedContracts.MessageAqFactoryGrants,
      MessageAqFactory__factory.abi,
      deployer
    )

    // const vkRegistry = new ethers.Contract(deployedContracts.VkRegistry, VkRegistry__factory.abi, deployer)

    const qfi = new ethers.Contract(deployedContracts.QFI, QFI__factory.abi, deployer)

    // Send txs.
    let spinner = customSpinner(`Set MACI instance for SimpleHackathon contract`, "point")
    spinner.start()

    let tx = await simpleHackathon.connect(deployer).setMaciInstance(qfi.address, { gasPrice, gasLimit })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Set MACI instance for SimpleHackathon contract`)

    spinner = customSpinner(`Max number of recipients for the SimpleHackathon base registry`, "point")
    spinner.start()

    tx = await simpleHackathon.connect(deployer).setMaxRecipients(numberOfMaxRecipients, { gasPrice, gasLimit })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Max number of recipients for the SimpleHackathon base registry`)

    spinner = customSpinner(`Transfer PollFactory ownership to QFI contract`, "point")
    spinner.start()

    tx = await pollFactory.connect(deployer).transferOwnership(qfi.address, { gasPrice, gasLimit })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Transfer PollFactory ownership to QFI contract`)

    spinner = customSpinner(`Transfer GrantRoundFactory ownership to QFI contract`, "point")
    spinner.start()

    tx = await grantRoundFactory.connect(deployer).transferOwnership(qfi.address, { gasPrice, gasLimit })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Transfer GrantRoundFactory ownership to QFI contract`)

    spinner = customSpinner(`Transfer MessageAq ownership to PollFactory contract`, "point")
    spinner.start()

    tx = await messageAqFactory.connect(deployer).transferOwnership(pollFactory.address, { gasPrice, gasLimit })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Transfer MessageAq ownership to PollFactory contract`)

    spinner = customSpinner(`Transfer MessageAqFactoryGrants ownership to GrantRoundFactory contract`, "point")
    spinner.start()

    tx = await messageAqFactoryGrants
      .connect(deployer)
      .transferOwnership(grantRoundFactory.address, { gasPrice, gasLimit })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Transfer MessageAqFactoryGrants ownership to GrantRoundFactory contract`)

    spinner = customSpinner(`Initialize QFI contract`, "point")
    spinner.start()

    tx = await qfi
      .connect(deployer)
      .initialize(deployedContracts.VKRegistry, messageAqFactory.address, messageAqFactoryGrants.address, {
        gasPrice,
        gasLimit
      })
    await tx.wait()
    spinner.stop()
    console.log(`${logSymbols.success} Initialize QFI contract`)

    // TODO: Set up vk registry
    // const stateTreeDepth = await qfi.stateTreeDepth();
    // const _stateTreeDepth = stateTreeDepth.toString();
    // const _intStateTreeDepth = treeDepths.intStateTreeDepth;
    // const _messageTreeDepth = treeDepths.messageTreeDepth;
    // const _voteOptionTreeDepth = treeDepths.voteOptionTreeDepth;
    // const _messageBatchSize = messageBatchSize.toString();
    // const _processVk = <VerifyingKeyStruct>testProcessVk.asContractParam();
    // const _tallyVk = <VerifyingKeyStruct>testTallyVk.asContractParam();

    // await vkRegistry.setVerifyingKeys(
    //   _stateTreeDepth,
    //   _intStateTreeDepth,
    //   _messageTreeDepth,
    //   _voteOptionTreeDepth,
    //   _messageBatchSize,
    //   _processVk,
    //   _tallyVk
    // );

    // await vkRegistry.genProcessVkSig(_stateTreeDepth, _messageTreeDepth, _voteOptionTreeDepth, _messageBatchSize);
    // await vkRegistry.genTallyVkSig(_stateTreeDepth, _intStateTreeDepth, _voteOptionTreeDepth);

    console.log(`\n${logSymbols.success} You have successfully initialized the deployed MACI/QFI smart contracts 🎊\n`)
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

export default initialize
