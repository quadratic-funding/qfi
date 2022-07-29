# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/compare/v2.0.1...v2.1.0) (2022-07-08)


### Features

* **all:** ethBarcelona changes ([5e59b1a](https://github.com/commit/5e59b1add68fe141269e8d42a08e605af3c916cb))
* **ethbarcelona: cli easy setup:** change max projects ([9a88f84](https://github.com/commit/9a88f843f621ac6e83ded42dc64a7059b51ecc7b))





## [2.0.1](https://github.com/compare/v2.0.0...v2.0.1) (2022-06-29)

**Note:** Version bump only for package @qfi/qfi





# [2.0.0](https://github.com/compare/v1.5.0...v2.0.0) (2022-06-29)


### Features

* **ethbarcelona cli:** configure cli for eth barcelona: polygon support ([5c87081](https://github.com/commit/5c8708192f0ab5615d8a2c909917e4a9a73d4df9))
* **polygon support:** gas price tweaks, eject csv of public keys on key gen ([0ff3ab0](https://github.com/commit/0ff3ab0526069b21e808d73239c0d1c19d706826))





# [1.6.0](https://github.com/compare/v1.5.0...v1.6.0) (2022-06-29)


### Features

* **ethbarcelona cli:** configure cli for eth barcelona: polygon support ([5c87081](https://github.com/commit/5c8708192f0ab5615d8a2c909917e4a9a73d4df9))
* **polygon support:** gas price tweaks, eject csv of public keys on key gen ([0ff3ab0](https://github.com/commit/0ff3ab0526069b21e808d73239c0d1c19d706826))





# [1.5.0](https://github.com/compare/v1.4.1...v1.5.0) (2022-06-11)


### Features

* **app:** graceful error handling on MACI key input ([f1b11db](https://github.com/commit/f1b11dbb1f999d1a5cf21cf23492bdace15cd26e))





## [1.4.1](https://github.com/compare/v1.4.0...v1.4.1) (2022-06-11)

**Note:** Version bump only for package @qfi/qfi





# [1.4.0](https://github.com/compare/v1.3.0...v1.4.0) (2022-06-11)


### Features

* **cli:** command to fund user wallets for ethPrague ([aec08b6](https://github.com/commit/aec08b6c608fb535c3e21832a58edcc9253a8b38))





# [1.3.0](https://github.com/compare/v1.2.0...v1.3.0) (2022-06-10)


### Bug Fixes

* **cli:** patch prague deploy ([c4eb8dd](https://github.com/commit/c4eb8ddab9594772e5e72f5a5640b3a24f960320))





# [1.2.0](https://github.com/compare/v1.1.0...v1.2.0) (2022-06-10)

**Note:** Version bump only for package @qfi/qfi





# [1.1.0](https://github.com/compare/v1.0.1...v1.1.0) (2022-06-10)


### Features

* **cli:** dothething command to batch all the other commands ([0254747](https://github.com/commit/0254747fdc6da224300986d476a855ab289f65b1))



# [0.4.0](https://github.com/compare/v0.3.3...v0.4.0) (2022-06-09)


### Bug Fixes

* build error due to missing data source ([aa8d6d7](https://github.com/commit/aa8d6d771924ca44b255611694bb730cbbbc3c09))
* missing SimpleHackathon source on subgraph.yaml ([44eaeea](https://github.com/commit/44eaeeaca442fc3409e5ad050bf346d0ce594064))


### Features

* add basic signup command; minors and code lint ([1a3bab8](https://github.com/commit/1a3bab8b065ae64b5c3c47590e633745e77abce4))
* track SimpleHackathon contract as a recipient registry in the subgraph ([abe27c5](https://github.com/commit/abe27c5a9be033192eaa47af3ee5c02824bcaad1))






## [1.0.1](https://github.com/compare/v1.0.0...v1.0.1) (2022-06-09)


### Reverts

* npm revert to 0.3.3 ([68e6766](https://github.com/commit/68e676698356c95e7e456622138407993150e943))



## [0.3.3](https://github.com/compare/v0.3.2...v0.3.3) (2022-06-09)


### Bug Fixes

* numeric overflow when passing initial supply of ERC20 token to contract ([375b63c](https://github.com/commit/375b63cfe144d36c0ccd97f34f34f8b2e0d020ec))





## [0.3.1](https://github.com/compare/v0.2.2...v0.3.1) (2022-06-09)


### Bug Fixes

* add missing converter for request type ([9766979](https://github.com/commit/9766979ba5257132deaacf43332c5b956cd21156))
* **app:** fixed babel error that converts ** to .pow causing build failure with Bigint error ([ac2d7d5](https://github.com/commit/ac2d7d54ceb31f7c02d4d6bd110caf3c019cdf11))
* change from a new creation of a QFI scheme to its loading for the same id ([b7af432](https://github.com/commit/b7af432ef46b441fa2eafd664bced4ec40182e3b))
* converters and qfi initialization ([969c1b4](https://github.com/commit/969c1b4c1d0468c2031cd3084e8300ce78d67e97))
* missing abis for different data sources ([0cf3a3d](https://github.com/commit/0cf3a3d30633bcc30861b34f979f900035bd7a2d))
* removed non-nullable property for wrong variables when deploying QFI ([d5cf5c9](https://github.com/commit/d5cf5c90c1ea77775d24fa9807dcbe8ea83eacfa))
* wrong controller parameter value passed to SimpleRecipientRegistry constructor ([26c8c11](https://github.com/commit/26c8c119245ed5298c59c58eadd6d682d1e9f32d))
* wrong deploy script name in package.json; code lint and fix ([2d241b2](https://github.com/commit/2d241b2a8c3b1ea8b420ba937702153d2ba1ef8f))


### Features

* add MACI/QFI smart contracts initialization command ([24491cf](https://github.com/commit/24491cf61615f74674c1c0161bc2d366792adbea))
* add missing grant round factory entity for managing pre-QFI Recipient Registry change ([0495196](https://github.com/commit/0495196d92189189616f460e6fa272068fc8be88))
* **cli:** crate prague erc20, mint with 18 decimals ([dc40032](https://github.com/commit/dc40032fba08832b35bb5ce4862bd77952908e00))





# [0.3.0](https://github.com/compare/v0.2.2...v0.3.0) (2022-06-08)


### Bug Fixes

* add missing converter for request type ([9766979](https://github.com/commit/9766979ba5257132deaacf43332c5b956cd21156))
* change from a new creation of a QFI scheme to its loading for the same id ([b7af432](https://github.com/commit/b7af432ef46b441fa2eafd664bced4ec40182e3b))
* converters and qfi initialization ([969c1b4](https://github.com/commit/969c1b4c1d0468c2031cd3084e8300ce78d67e97))
* missing abis for different data sources ([0cf3a3d](https://github.com/commit/0cf3a3d30633bcc30861b34f979f900035bd7a2d))
* removed non-nullable property for wrong variables when deploying QFI ([d5cf5c9](https://github.com/commit/d5cf5c90c1ea77775d24fa9807dcbe8ea83eacfa))


### Features

* add missing grant round factory entity for managing pre-QFI Recipient Registry change ([0495196](https://github.com/commit/0495196d92189189616f460e6fa272068fc8be88))





## [0.2.2](https://github.com/compare/v0.2.1...v0.2.2) (2022-06-08)


### Bug Fixes

* **app:** connect button on mobile ([7799767](https://github.com/commit/77997672b6065782bdb4f65211dda1767a57369e))





## [0.2.1](https://github.com/compare/v0.2.0...v0.2.1) (2022-06-08)


### Features

* **app:** add project to ballots via search params and enforce voting rules ([a139415](https://github.com/commit/a13941580e11d80a4324d2c7f1df727f1f716e8d))
* **contracts:** emergency fund distribution on round cancel ([1c55859](https://github.com/commit/1c55859b96815f032161b9d20bbee42163a56e2b))





# [0.2.0](https://github.com/compare/v0.1.0...v0.2.0) (2022-06-03)


### Features

* **contracts:** simple hackathon contracts, 99% code coverage ([aed7974](https://github.com/commit/aed79744022e4c2f1f72bcb2ce0b342914576cca))
* implement Capital Constaint for QF, fix failing tests ([30efe04](https://github.com/commit/30efe04634afb461da7d88e7cc818a6f0707421e))


### BREAKING CHANGES

* **contracts:** fixed maci decorators to verify tally results, disabled contribution payouts since
sign ups will not require contribution
* changes the finalization step on QF rounds





# [0.1.0](https://github.com/compare/v0.0.4...v0.1.0) (2022-06-02)


### Bug Fixes

* **all:** make lerna commands play nice with yarn workspaces ([5717344](https://github.com/commit/57173443e138d89320e8316f93375ab139fb8d9c))
* change packages order when running build from root to avoid broken links among them ([09e5b32](https://github.com/commit/09e5b32ae619d21f08cb8ffe84c0a193dd1a1ebe))


### Features

* add command to authenticate via a wallet mnemonic phrase ([d15f1d2](https://github.com/commit/d15f1d2212845372e3c520bf539c5c7f3d0125c7))





## [0.0.4](https://github.com/compare/v0.0.3...v0.0.4) (2022-06-01)

**Note:** Version bump only for package @qfi/qfi





## [0.0.3](https://github.com/compare/v0.0.2...v0.0.3) (2022-06-01)


### Bug Fixes

* **all:** fix circular dependencies, changes to hoisting in monorepo, fix failing build ([1421c97](https://github.com/commit/1421c971a8dd5a85d96fbf67baf5a0dac6a7b062))
* **ci:** build failing ([e85b744](https://github.com/commit/e85b74426f45a3b75148e82cfaf85cee62da0701))





## 0.0.2 (2022-06-01)


### Bug Fixes

* add missing initialization to start indexing Grant Round templates ([ab1e435](https://github.com/commit/ab1e435ea8dadfe107038c7e547f51c8579a33c0))
* match eslint version of subgraph and cli packages to app to avoid build errors ([bbe6141](https://github.com/commit/bbe61411060b8143809f8e6a66e94aee0ad8f3fc))
* solve build errors ([f36722a](https://github.com/commit/f36722afeeadb2a7e5d560ae0db94a4ff2e60755))
* typo when retrieving an event param ([03f036a](https://github.com/commit/03f036ae3df56c3fbeff6b060ea23f4145d04970))
* update abi imports from build to typechain folder ([26917de](https://github.com/commit/26917de487116c38c66259304371ea242982e6a3))
* wrong workaround address ([8bddfb4](https://github.com/commit/8bddfb467a9c17cf457ac3f60f0cae0afe4b069f))


### Features

* add cli boilerplate ([55299af](https://github.com/commit/55299af20bf7c2bd12be7a55f31c520271be2ecd))
* add deploy MACI/QFI smart contracts command ([4af03d8](https://github.com/commit/4af03d8f8f69d3041ddc7ca6451955d42c38a560))
* add first complete draft of all necessary mappings ([ef93b3d](https://github.com/commit/ef93b3d7b6829bbeb712b84c0abae16e753bc781))
* add genkeys command ([d900757](https://github.com/commit/d9007573a51577df551240bdaf259f589b07a3e1))
* add QR code scan for Admin page ([d948b08](https://github.com/commit/d948b08001904412c11b02dba988fcf874bed2a1))
* add register recipients command ([3feff1d](https://github.com/commit/3feff1d82f11e7b63f51cba131743228d3aeb7f5))
* add relationship between Contributor and PublicKey entities ([6316bb3](https://github.com/commit/6316bb31bc64db24ada6c8699baf6c422eeccf2d))
* add sender and tx hash tracking for message entity ([54f627b](https://github.com/commit/54f627b30611d7f31abad12437398d68148b836a))
* add subgraph yaml; add empty mapping files for graph codegen ([03c2eaa](https://github.com/commit/03c2eaa435f8a3a8f4962ce2676aa0f40d136358))
* add tracking of contributions and lifetime amount for PublicKey ([55da83c](https://github.com/commit/55da83ccd61507ce589369feb2cd9bc43878a1f4))
* add unit test for QFI deploy and initialization ([4151380](https://github.com/commit/41513804565cf86485ca4890f748369c3e9d395d))
* store tx hash when creating a new Contributor ([ae8459e](https://github.com/commit/ae8459e08d0d156cf889e69168e7c12de2273e55))
