# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/quadratic-funding/qfi/compare/v2.0.1...v2.1.0) (2022-07-08)


### Features

* **ethbarcelona: cli easy setup:** change max projects ([9a88f84](https://github.com/quadratic-funding/qfi/commit/9a88f843f621ac6e83ded42dc64a7059b51ecc7b))





# [2.0.0](https://github.com/quadratic-funding/qfi/compare/v1.5.0...v2.0.0) (2022-06-29)


### Features

* **ethbarcelona cli:** configure cli for eth barcelona: polygon support ([5c87081](https://github.com/quadratic-funding/qfi/commit/5c8708192f0ab5615d8a2c909917e4a9a73d4df9))
* **polygon support:** gas price tweaks, eject csv of public keys on key gen ([0ff3ab0](https://github.com/quadratic-funding/qfi/commit/0ff3ab0526069b21e808d73239c0d1c19d706826))





# [1.6.0](https://github.com/quadratic-funding/qfi/compare/v1.5.0...v1.6.0) (2022-06-29)


### Features

* **ethbarcelona cli:** configure cli for eth barcelona: polygon support ([5c87081](https://github.com/quadratic-funding/qfi/commit/5c8708192f0ab5615d8a2c909917e4a9a73d4df9))
* **polygon support:** gas price tweaks, eject csv of public keys on key gen ([0ff3ab0](https://github.com/quadratic-funding/qfi/commit/0ff3ab0526069b21e808d73239c0d1c19d706826))





# [1.5.0](https://github.com/quadratic-funding/qfi/compare/v1.4.1...v1.5.0) (2022-06-11)

**Note:** Version bump only for package @qfi/contracts





# [1.4.0](https://github.com/quadratic-funding/qfi/compare/v1.3.0...v1.4.0) (2022-06-11)

**Note:** Version bump only for package @qfi/contracts





# [1.1.0](https://github.com/quadratic-funding/qfi/compare/v1.0.1...v1.1.0) (2022-06-10)


### Features

* **cli:** dothething command to batch all the other commands ([0254747](https://github.com/quadratic-funding/qfi/commit/0254747fdc6da224300986d476a855ab289f65b1))





# [1.0.0](https://github.com/quadratic-funding/qfi/compare/v0.3.3...v1.0.0) (2022-06-09)

**Note:** Version bump only for package @qfi/contracts





## [0.3.3](https://github.com/quadratic-funding/qfi/compare/v0.3.2...v0.3.3) (2022-06-09)

**Note:** Version bump only for package @qfi/contracts





## [0.3.1](https://github.com/quadratic-funding/qfi/compare/v0.2.2...v0.3.1) (2022-06-09)


### Bug Fixes

* wrong controller parameter value passed to SimpleRecipientRegistry constructor ([26c8c11](https://github.com/quadratic-funding/qfi/commit/26c8c119245ed5298c59c58eadd6d682d1e9f32d))


### Features

* **cli:** crate prague erc20, mint with 18 decimals ([dc40032](https://github.com/quadratic-funding/qfi/commit/dc40032fba08832b35bb5ce4862bd77952908e00))





# [0.3.0](https://github.com/quadratic-funding/qfi/compare/v0.2.2...v0.3.0) (2022-06-08)

**Note:** Version bump only for package @qfi/contracts





## [0.2.1](https://github.com/quadratic-funding/qfi/compare/v0.2.0...v0.2.1) (2022-06-08)


### Features

* **contracts:** emergency fund distribution on round cancel ([1c55859](https://github.com/quadratic-funding/qfi/commit/1c55859b96815f032161b9d20bbee42163a56e2b))





# [0.2.0](https://github.com/quadratic-funding/qfi/compare/v0.1.0...v0.2.0) (2022-06-03)


### Features

* **contracts:** simple hackathon contracts, 99% code coverage ([aed7974](https://github.com/quadratic-funding/qfi/commit/aed79744022e4c2f1f72bcb2ce0b342914576cca))
* implement Capital Constaint for QF, fix failing tests ([30efe04](https://github.com/quadratic-funding/qfi/commit/30efe04634afb461da7d88e7cc818a6f0707421e))


### BREAKING CHANGES

* **contracts:** fixed maci decorators to verify tally results, disabled contribution payouts since
sign ups will not require contribution
* changes the finalization step on QF rounds





# [0.1.0](https://github.com/quadratic-funding/qfi/compare/v0.0.4...v0.1.0) (2022-06-02)

**Note:** Version bump only for package @qfi/contracts





## [0.0.4](https://github.com/quadratic-funding/qfi/compare/v0.0.3...v0.0.4) (2022-06-01)

**Note:** Version bump only for package @qfi/contracts





## [0.0.3](https://github.com/quadratic-funding/qfi/compare/v0.0.2...v0.0.3) (2022-06-01)


### Bug Fixes

* **all:** fix circular dependencies, changes to hoisting in monorepo, fix failing build ([1421c97](https://github.com/quadratic-funding/qfi/commit/1421c971a8dd5a85d96fbf67baf5a0dac6a7b062))
* **ci:** build failing ([e85b744](https://github.com/quadratic-funding/qfi/commit/e85b74426f45a3b75148e82cfaf85cee62da0701))





## 0.0.2 (2022-06-01)


### Bug Fixes

* update abi imports from build to typechain folder ([26917de](https://github.com/quadratic-funding/qfi/commit/26917de487116c38c66259304371ea242982e6a3))
* wrong workaround address ([8bddfb4](https://github.com/quadratic-funding/qfi/commit/8bddfb467a9c17cf457ac3f60f0cae0afe4b069f))


### Features

* add unit test for QFI deploy and initialization ([4151380](https://github.com/quadratic-funding/qfi/commit/41513804565cf86485ca4890f748369c3e9d395d))
