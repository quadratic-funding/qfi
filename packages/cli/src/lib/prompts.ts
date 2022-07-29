import ora, { Ora } from "ora"
import prompts, { Answers } from "prompts"

/**
 * Show a binary question with custom options for confirmation purposes.
 * @param question <string> - the question to be answered.
 * @param active <string> - the active option (= yes).
 * @param inactive <string> - the inactive option (= no).
 * @returns <Promise<Answers<string>>>
 */
export const askForConfirmation = async (question: string, active = "yes", inactive = "no"): Promise<Answers<string>> =>
  prompts({
    type: "toggle",
    name: "confirmation",
    message: question,
    initial: false,
    active,
    inactive
  })

/**
 * Return a custom spinner.
 * @param text <string> - the text that should be displayed as spinner status.
 * @param spinnerLogo <any> - the logo.
 * @returns <Ora> - a new Ora custom spinner.
 */
export const customSpinner = (text: string, spinnerLogo: any): Ora =>
  ora({
    text,
    spinner: spinnerLogo
  })
