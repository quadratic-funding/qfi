#!/usr/bin/env node
import clear from "clear"
import logSymbols from "log-symbols"
import chalk from "chalk"
import { getWalletFromMnemonic } from "../lib/blockchain.js"
import { directoryExists, makeDir, writeFileSync } from "../lib/files.js"
import { outputDirPath, mnemonicFilePath, mnemonicBaseDirPath, header } from "../lib/constants.js"
import { askForConfirmation } from "../lib/prompts.js"

/**
 * Auth command.
 * @param mnemonic <string> - the secret mnemonic phrase (e.g., 12 words) separated by spaces.
 */
async function auth(mnemonic: string) {
  clear()

  console.log(header)

  try {
    // Check for output directory.
    if (!directoryExists(outputDirPath)) makeDir(outputDirPath)

    // Check if mnemonic already present.
    if (!directoryExists(mnemonicBaseDirPath)) makeDir(mnemonicBaseDirPath)
    else {
      // Prompt for user.
      console.log(`\n${logSymbols.info} Seems that you have already provided a mnemonic for the authentication!\n`)

      const { confirmation } = await askForConfirmation(
        "Are you sure you want to continue? (nb. confirmation will overwrite your mnemonic)",
        "yes",
        "no"
      )

      if (!confirmation) {
        console.log(`\nFarewell 👋`)
        process.exit(0)
      }
    }

    // Get wallet from mnemonic.
    const wallet = getWalletFromMnemonic(mnemonic)

    // Store mnemonic locally.
    writeFileSync(mnemonicFilePath, mnemonic)

    console.log(`\n${logSymbols.success} You are now authenticated as ${chalk.bold(wallet.address)} successfully 🎊`)
  } catch (err: any) {
    console.log(`\n${logSymbols.error} Something went wrong: ${err.message ?? err}`)
  }
}

export default auth
