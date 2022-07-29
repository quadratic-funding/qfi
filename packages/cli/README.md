<p align="center">
    <h1 align="center">
       QFI x ethTaiwan CLI
    </h1>
    <p align="center">All-in-one command-line for running QFI Round x ethTaiwan as administrator/operator</p>
</p>

<p align="center">
    <a href="https://github.com/quadratic-funding/qfi/tree/cohort/ethTaiwan/packages/cli" target="_blank">
        <img src="https://img.shields.io/badge/project-cli-blue">
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/quadratic-funding/qfi?style=flat-square">
</p>

<div align="center">
    <h4>
        <a href="#">
            👥 Contributing (WIP)
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="#">
            🤝 Code of conduct (WIP)
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="#">
            🗣️ Chat &amp; Support (WIP)
        </a>
    </h4>
</div>

---

## Commands

- `ethtaiwancli`: CLI entry point.
- `ethtaiwancli auth \"<mnemonic>\"`: Allow to interact with the blockchain-related commands (e.g., deploy) with a wallet by passing in wallet's mnemonic.
  - `<mnemonic>`: the secret mnemonic phrase (e.g., 12 words) separated by spaces (e.g., "test test test test test test test test test test test junk"). _nb. the double quotes are mandatory!_
- `ethtaiwancli genkeys <amount>`: Generate a new specified amount of MACI and ETH keypairs (QR Codes inclueded).
  - `<amount>`: amount of MACI and ETH keypairs to be generated (e.g., 3000)
- `ethtaiwancli contracts:deploy <network>`: Deploy the smart contracts infrastructure necessary for running a new QFI/MACI instance for a specified network.
  - `<network>`: the network where the contracts will be deployed (e.g., xdai)
- `ethtaiwancli contracts:add-recipients <network> <path>`: Add recipients on RecipientRegistry Smart Contract deployed on the network by taking data from CSV input file specified in the path.
  - `<network>`: the network where the contracts has been deployed (e.g., xdai)
  - `<path>`: the path of the CSV input file where the recipients data is stored (e.g., ~/Desktop/my*recipients_data.csv`).
    \_nb. The CSV file must contain rows organized as follows:* \* _name_ \* _tagline_ \* _description_ \* _problemSpace_ \* _ethereumAddress_ \* _contactEmail_ \* _teamName (optional)_ \* _teamDescription (optional)_ \* _githubUrl (optional)_ \* _radicleUrl (optional)_ \* _websiteUrl (optional)_ \* _twitterUr (optional)_ \* _discordUrl (optional)_ \* _bannerImageHash_ \* _thumbnailImageHash_

## Examples

- `ethtaiwancli auth "test test test test test test test test test test test junk"`
- `ethtaiwancli genkeys 3000`
- `ethtaiwancli contracts:deploy xdai`
- `ethtaiwancli contracts:add-recipients xdai ~/Desktop/my_recipients_data.csv`

## Getting Started

### Prerequisities

You need to have the following installed:

git >= 2.25.1
node >= 16.14.0
npm >= 8.9.0
yarn >= 1.22.18

### Local Development

```bash
https://github.com/quadratic-funding/qfi.git
cd qfi
git checkout cohort/ethTaiwan
yarn
yarn build
cd packages/cli
npm i -g
# You are ready to run the commands as above :)
```
