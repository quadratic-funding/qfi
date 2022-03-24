import { ethers } from "hardhat"
import { BigNumberish, Signer } from "ethers"
import chai from "chai"
import { solidity } from "ethereum-waffle"
import { Keypair, VerifyingKey } from "maci-domainobjs"
import { G1Point, G2Point } from "maci-crypto"

import { PoseidonT3 } from "../../typechain/PoseidonT3"
import { PoseidonT3__factory } from "../../typechain/factories/PoseidonT3__factory"

import { PoseidonT4 } from "../../typechain/PoseidonT4"
import { PoseidonT4__factory } from "../../typechain/factories/PoseidonT4__factory"

import { PoseidonT5 } from "../../typechain/PoseidonT5"
import { PoseidonT5__factory } from "../../typechain/factories/PoseidonT5__factory"

import { PoseidonT6 } from "../../typechain/PoseidonT6"
import { PoseidonT6__factory } from "../../typechain/factories/PoseidonT6__factory"

import {
  GrantRoundFactoryLibraryAddresses,
  GrantRoundFactory__factory
} from "../../typechain/factories/GrantRoundFactory__factory"
import {
  PollFactory__factory,
  PollFactoryLibraryAddresses
} from "../../typechain/factories/PollFactory__factory"

import {
  MessageAqFactory__factory,
  MessageAqFactoryLibraryAddresses
} from "../../typechain/factories/MessageAqFactory__factory"
import {
  QFI__factory,
  QFILibraryAddresses
} from "../../typechain/factories/QFI__factory"

import { GrantRoundFactory } from "../../typechain/GrantRoundFactory"
import { PollFactory } from "../../typechain/PollFactory"
import { MessageAqFactory } from "../../typechain/MessageAqFactory"
import { QFI } from "../../typechain/QFI"

import { VkRegistry__factory } from "../../typechain/factories/VkRegistry__factory"
import { FreeForAllGatekeeper__factory } from "../../typechain/factories/FreeForAllGatekeeper__factory"
import { ConstantInitialVoiceCreditProxy__factory } from "../../typechain/factories/ConstantInitialVoiceCreditProxy__factory"

import { VerifyingKeyStruct, VkRegistry } from "../../typechain/VkRegistry"
import { FreeForAllGatekeeper } from "../../typechain/FreeForAllGatekeeper"
import { ConstantInitialVoiceCreditProxy } from "../../typechain/ConstantInitialVoiceCreditProxy"

import { OptimisticRecipientRegistry } from "../../typechain/OptimisticRecipientRegistry"
import { OptimisticRecipientRegistry__factory } from "../../typechain/factories/OptimisticRecipientRegistry__factory"

import { BaseERC20Token } from "../../typechain/BaseERC20Token"
import { BaseERC20Token__factory } from "../../typechain/factories/BaseERC20Token__factory"

import { PollProcessorAndTallyer } from "../../typechain/PollProcessorAndTallyer"
import { PollProcessorAndTallyer__factory } from "../../typechain/factories/PollProcessorAndTallyer__factory"

import { MockVerifier } from "../../typechain/MockVerifier"
import { MockVerifier__factory } from "../../typechain/factories/MockVerifier__factory"

chai.use(solidity)
const { expect } = chai
const testProcessVk = new VerifyingKey(
  new G1Point(BigInt(0), BigInt(1)),
  new G2Point([BigInt(2), BigInt(3)], [BigInt(4), BigInt(5)]),
  new G2Point([BigInt(6), BigInt(7)], [BigInt(8), BigInt(9)]),
  new G2Point([BigInt(10), BigInt(11)], [BigInt(12), BigInt(13)]),
  [new G1Point(BigInt(14), BigInt(15)), new G1Point(BigInt(16), BigInt(17))]
)

const testTallyVk = new VerifyingKey(
  new G1Point(BigInt(0), BigInt(1)),
  new G2Point([BigInt(2), BigInt(3)], [BigInt(4), BigInt(5)]),
  new G2Point([BigInt(6), BigInt(7)], [BigInt(8), BigInt(9)]),
  new G2Point([BigInt(10), BigInt(11)], [BigInt(12), BigInt(13)]),
  [new G1Point(BigInt(14), BigInt(15)), new G1Point(BigInt(16), BigInt(17))]
)

describe("Configure - QV Infrastructure and vkRegistry", () => {
  let deployer: Signer
  let deployerAddress: string
  let PoseidonT3Factory: PoseidonT3__factory
  let PoseidonT4Factory: PoseidonT4__factory
  let PoseidonT5Factory: PoseidonT5__factory
  let PoseidonT6Factory: PoseidonT6__factory

  let linkedLibraryAddresses:
    | QFILibraryAddresses
    | PollFactoryLibraryAddresses
    | MessageAqFactoryLibraryAddresses
    | GrantRoundFactoryLibraryAddresses
  let GrantRoundFactory: GrantRoundFactory__factory
  let PollFactoryFactory: PollFactory__factory
  let MessageAqFactoryFactory: MessageAqFactory__factory

  let FreeForAllGateKeeperFactory: FreeForAllGatekeeper__factory
  let ConstantInitialVoiceCreditProxyFactory: ConstantInitialVoiceCreditProxy__factory
  let VKRegistryFactory: VkRegistry__factory

  let RecipientRegistryFactory: OptimisticRecipientRegistry__factory
  let BaseERC20TokenFactory: BaseERC20Token__factory
  let PollProcessorAndTallyerFactory: PollProcessorAndTallyer__factory
  let MockVerifierFactory: MockVerifier__factory

  let QFIFactory: QFI__factory

  let PoseidonT3: PoseidonT3
  let PoseidonT4: PoseidonT4
  let PoseidonT5: PoseidonT5
  let PoseidonT6: PoseidonT6
  let grantRoundFactory: GrantRoundFactory
  let pollFactory: PollFactory
  let messageAqFactory: MessageAqFactory
  let messageAqFactoryGrants: MessageAqFactory
  let vkRegistry: VkRegistry
  let constantInitialVoiceCreditProxy: ConstantInitialVoiceCreditProxy
  let freeForAllGateKeeper: FreeForAllGatekeeper
  let optimisticRecipientRegistry: OptimisticRecipientRegistry
  let baseERC20Token: BaseERC20Token
  let pollProcessorAndTallyer: PollProcessorAndTallyer
  let mockVerifier: MockVerifier
  let qfi: QFI
  let coordinator: Keypair

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()
    deployerAddress = await deployer.getAddress()
    PoseidonT3Factory = new PoseidonT3__factory(deployer)
    PoseidonT4Factory = new PoseidonT4__factory(deployer)
    PoseidonT5Factory = new PoseidonT5__factory(deployer)
    PoseidonT6Factory = new PoseidonT6__factory(deployer)
    PoseidonT3 = await PoseidonT3Factory.deploy()
    PoseidonT4 = await PoseidonT4Factory.deploy()
    PoseidonT5 = await PoseidonT5Factory.deploy()
    PoseidonT6 = await PoseidonT6Factory.deploy()

    linkedLibraryAddresses = {
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]:
        PoseidonT5.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]:
        PoseidonT3.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]:
        PoseidonT6.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]:
        PoseidonT4.address
    }

    GrantRoundFactory = new GrantRoundFactory__factory(
      { ...linkedLibraryAddresses },
      deployer
    )
    PollFactoryFactory = new PollFactory__factory(
      { ...linkedLibraryAddresses },
      deployer
    )
    MessageAqFactoryFactory = new MessageAqFactory__factory(
      { ...linkedLibraryAddresses },
      deployer
    )
    QFIFactory = new QFI__factory({ ...linkedLibraryAddresses }, deployer)

    VKRegistryFactory = new VkRegistry__factory(deployer)
    ConstantInitialVoiceCreditProxyFactory =
      new ConstantInitialVoiceCreditProxy__factory(deployer)
    FreeForAllGateKeeperFactory = new FreeForAllGatekeeper__factory(deployer)
    RecipientRegistryFactory = new OptimisticRecipientRegistry__factory(
      deployer
    )
    BaseERC20TokenFactory = new BaseERC20Token__factory(deployer)
    PollProcessorAndTallyerFactory = new PollProcessorAndTallyer__factory(
      deployer
    )
    MockVerifierFactory = new MockVerifier__factory(deployer)

    optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(
      0,
      0,
      deployerAddress
    )
    grantRoundFactory = await GrantRoundFactory.deploy()
    grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address)
    pollFactory = await PollFactoryFactory.deploy()
    messageAqFactory = await MessageAqFactoryFactory.deploy()
    messageAqFactoryGrants = await MessageAqFactoryFactory.deploy()
    freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy()
    constantInitialVoiceCreditProxy =
      await ConstantInitialVoiceCreditProxyFactory.deploy(0)
    vkRegistry = await VKRegistryFactory.deploy()
    baseERC20Token = await BaseERC20TokenFactory.deploy(100)
    mockVerifier = await MockVerifierFactory.deploy()
    pollProcessorAndTallyer = await PollProcessorAndTallyerFactory.deploy(
      mockVerifier.address
    )
    coordinator = new Keypair()
  })

  describe("Configure Infrastructure", () => {
    it("verify - initialises Quadratic Funding Infrastructure", async () => {
      qfi = await QFIFactory.deploy(
        baseERC20Token.address,
        grantRoundFactory.address,
        pollFactory.address,
        freeForAllGateKeeper.address,
        constantInitialVoiceCreditProxy.address
      )
      await expect(pollFactory.transferOwnership(qfi.address))
        .to.emit(pollFactory, "OwnershipTransferred")
        .withArgs(deployerAddress, qfi.address)

      await expect(grantRoundFactory.transferOwnership(qfi.address))
        .to.emit(grantRoundFactory, "OwnershipTransferred")
        .withArgs(deployerAddress, qfi.address)

      await expect(messageAqFactory.transferOwnership(pollFactory.address))
        .to.emit(messageAqFactory, "OwnershipTransferred")
        .withArgs(deployerAddress, pollFactory.address)

      await expect(
        messageAqFactoryGrants.transferOwnership(grantRoundFactory.address)
      )
        .to.emit(messageAqFactoryGrants, "OwnershipTransferred")
        .withArgs(deployerAddress, grantRoundFactory.address)

      await expect(
        qfi.initialize(
          vkRegistry.address,
          messageAqFactory.address,
          messageAqFactoryGrants.address
        )
      )
        .to.emit(qfi, "Init")
        .withArgs(vkRegistry.address, messageAqFactory.address)
    })
    it("verify - set verifying keys in vkRegistry contract", async () => {
      const stateTreeDepth = await qfi.stateTreeDepth()
      const _stateTreeDepth = stateTreeDepth.toString()
      const _intStateTreeDepth = 1
      const _messageTreeDepth = 4
      const _voteOptionTreeDepth = 2
      const _messageBatchSize = 25
      const _processVk = <VerifyingKeyStruct>testProcessVk.asContractParam()
      const _tallyVk = <VerifyingKeyStruct>testTallyVk.asContractParam()

      const { status } = await vkRegistry
        .setVerifyingKeys(
          _stateTreeDepth,
          _intStateTreeDepth,
          _messageTreeDepth,
          _voteOptionTreeDepth,
          _messageBatchSize,
          _processVk,
          _tallyVk
        )
        .then((tx) => tx.wait())

      expect(status).to.equal(1)

      const pSig = await vkRegistry.genProcessVkSig(
        _stateTreeDepth,
        _messageTreeDepth,
        _voteOptionTreeDepth,
        _messageBatchSize
      )

      const isPSigSet = await vkRegistry.isProcessVkSet(pSig)
      expect(isPSigSet).to.be.true

      const tSig = await vkRegistry.genTallyVkSig(
        _stateTreeDepth,
        _intStateTreeDepth,
        _voteOptionTreeDepth
      )
      const isTSigSet = await vkRegistry.isTallyVkSet(tSig)
      expect(isTSigSet).to.be.true

      // Check that the VKs are set
      const processVkOnChain = await vkRegistry.getProcessVk(
        _stateTreeDepth,
        _messageTreeDepth,
        _voteOptionTreeDepth,
        _messageBatchSize
      )
      expect(processVkOnChain).to.have.own.property("alpha1")

      const tallyVkOnChain = await vkRegistry.getTallyVk(
        _stateTreeDepth,
        _intStateTreeDepth,
        _voteOptionTreeDepth
      )
      expect(tallyVkOnChain).to.have.own.property("alpha1")
      expect(tallyVkOnChain.alpha1.x).to.not.be.empty
    })
    it("verify - sets Poll Processor And Tallyer", async () => {
      const { status } = await qfi
        .setPollProcessorAndTallyer(pollProcessorAndTallyer.address)
        .then((tx) => tx.wait())

      expect(status).to.equal(1)
      expect(await qfi.pollProcessorAndTallyer()).to.not.equal(
        ethers.constants.AddressZero
      )
    })
  })
})
