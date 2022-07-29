import { ethers } from "hardhat";
import { BigNumber, BigNumberish, Signer } from "ethers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Command, Keypair, Message, VerifyingKey } from "qaci-domainobjs";
import { G1Point, G2Point } from "qaci-crypto";
import { MaciState, genProcessVkSig, genTallyVkSig } from "qaci-core";
import { PoseidonT3 } from "../../typechain/PoseidonT3";
import { PoseidonT3__factory } from "../../typechain/factories/PoseidonT3__factory";

import { PoseidonT4 } from "../../typechain/PoseidonT4";
import { PoseidonT4__factory } from "../../typechain/factories/PoseidonT4__factory";

import { PoseidonT5 } from "../../typechain/PoseidonT5";
import { PoseidonT5__factory } from "../../typechain/factories/PoseidonT5__factory";

import { PoseidonT6 } from "../../typechain/PoseidonT6";
import { PoseidonT6__factory } from "../../typechain/factories/PoseidonT6__factory";

import {
  GrantRoundFactoryLibraryAddresses,
  GrantRoundFactory__factory,
} from "../../typechain/factories/GrantRoundFactory__factory";
import { PollFactory__factory, PollFactoryLibraryAddresses } from "../../typechain/factories/PollFactory__factory";

import {
  MessageAqFactory__factory,
  MessageAqFactoryLibraryAddresses,
} from "../../typechain/factories/MessageAqFactory__factory";
import { QFI__factory, QFILibraryAddresses } from "../../typechain/factories/QFI__factory";

import { GrantRoundFactory } from "../../typechain/GrantRoundFactory";
import { PollFactory } from "../../typechain/PollFactory";
import { MessageAqFactory } from "../../typechain/MessageAqFactory";
import { QFI } from "../../typechain/QFI";
import { Poll__factory } from "../../typechain/factories/Poll__factory";
import { MessageStruct, Poll } from "../../typechain/Poll";

import { VkRegistry__factory } from "../../typechain/factories/VkRegistry__factory";
import { FreeForAllGatekeeper__factory } from "../../typechain/factories/FreeForAllGatekeeper__factory";
import { ConstantInitialVoiceCreditProxy__factory } from "../../typechain/factories/ConstantInitialVoiceCreditProxy__factory";

import { VerifyingKeyStruct, VkRegistry } from "../../typechain/VkRegistry";
import { FreeForAllGatekeeper } from "../../typechain/FreeForAllGatekeeper";
import { ConstantInitialVoiceCreditProxy } from "../../typechain/ConstantInitialVoiceCreditProxy";

import { OptimisticRecipientRegistry } from "../../typechain/OptimisticRecipientRegistry";
import { OptimisticRecipientRegistry__factory } from "../../typechain/factories/OptimisticRecipientRegistry__factory";

import { BaseERC20Token } from "../../typechain/BaseERC20Token";
import { BaseERC20Token__factory } from "../../typechain/factories/BaseERC20Token__factory";

import { PollProcessorAndTallyer } from "../../typechain/PollProcessorAndTallyer";
import { PollProcessorAndTallyer__factory } from "../../typechain/factories/PollProcessorAndTallyer__factory";

import { MockVerifier } from "../../typechain/MockVerifier";
import { MockVerifier__factory } from "../../typechain/factories/MockVerifier__factory";
import { AccQueueQuinaryMaci } from "../../typechain/AccQueueQuinaryMaci";
import { AccQueueQuinaryMaci__factory } from "../../typechain";

chai.use(solidity);
const { expect } = chai;
const testProcessVk = new VerifyingKey(
  new G1Point(BigInt(0), BigInt(1)),
  new G2Point([BigInt(2), BigInt(3)], [BigInt(4), BigInt(5)]),
  new G2Point([BigInt(6), BigInt(7)], [BigInt(8), BigInt(9)]),
  new G2Point([BigInt(10), BigInt(11)], [BigInt(12), BigInt(13)]),
  [new G1Point(BigInt(14), BigInt(15)), new G1Point(BigInt(16), BigInt(17))]
);

const testTallyVk = new VerifyingKey(
  new G1Point(BigInt(0), BigInt(1)),
  new G2Point([BigInt(2), BigInt(3)], [BigInt(4), BigInt(5)]),
  new G2Point([BigInt(6), BigInt(7)], [BigInt(8), BigInt(9)]),
  new G2Point([BigInt(10), BigInt(11)], [BigInt(12), BigInt(13)]),
  [new G1Point(BigInt(14), BigInt(15)), new G1Point(BigInt(16), BigInt(17))]
);

describe("Process - Tally QV poll votes", () => {
  let deployer: Signer;
  let user1: Signer;
  let user2: Signer;
  let user3: Signer;
  let user4: Signer;
  let user5: Signer;
  let user6: Signer;
  let user7: Signer;
  let user8: Signer;
  let user9: Signer;
  let user10: Signer;

  let project1: Signer;
  let project2: Signer;
  let project3: Signer;
  let deployerAddress: string;
  let PoseidonT3Factory: PoseidonT3__factory;
  let PoseidonT4Factory: PoseidonT4__factory;
  let PoseidonT5Factory: PoseidonT5__factory;
  let PoseidonT6Factory: PoseidonT6__factory;

  let linkedLibraryAddresses:
    | QFILibraryAddresses
    | PollFactoryLibraryAddresses
    | MessageAqFactoryLibraryAddresses
    | GrantRoundFactoryLibraryAddresses;
  let GrantRoundFactory: GrantRoundFactory__factory;
  let PollFactoryFactory: PollFactory__factory;
  let MessageAqFactoryFactory: MessageAqFactory__factory;
  let MessageAq_Factory: AccQueueQuinaryMaci__factory;
  let FreeForAllGateKeeperFactory: FreeForAllGatekeeper__factory;
  let ConstantInitialVoiceCreditProxyFactory: ConstantInitialVoiceCreditProxy__factory;
  let VKRegistryFactory: VkRegistry__factory;

  let RecipientRegistryFactory: OptimisticRecipientRegistry__factory;
  let BaseERC20TokenFactory: BaseERC20Token__factory;
  let PollProcessorAndTallyerFactory: PollProcessorAndTallyer__factory;
  let MockVerifierFactory: MockVerifier__factory;

  let QFIFactory: QFI__factory;

  let PoseidonT3: PoseidonT3;
  let PoseidonT4: PoseidonT4;
  let PoseidonT5: PoseidonT5;
  let PoseidonT6: PoseidonT6;
  let grantRoundFactory: GrantRoundFactory;
  let pollFactory: PollFactory;
  let messageAqFactory: MessageAqFactory;
  let messageAqFactoryGrants: MessageAqFactory;
  let messageAq: AccQueueQuinaryMaci;

  let vkRegistry: VkRegistry;
  let constantInitialVoiceCreditProxy: ConstantInitialVoiceCreditProxy;
  let freeForAllGateKeeper: FreeForAllGatekeeper;
  let optimisticRecipientRegistry: OptimisticRecipientRegistry;
  let baseERC20Token: BaseERC20Token;
  let pollProcessorAndTallyer: PollProcessorAndTallyer;
  let mockVerifier: MockVerifier;
  let qfi: QFI;
  let coordinator: Keypair;
  let poll: Poll;
  let users: {
    maciKey: Keypair;
    signer: Signer;
    stateIndex: number;
  }[] = [];
  const duration = 15;
  const maxValues = {
    maxUsers: 25,
    maxMessages: 25,
    maxVoteOptions: 25,
  };
  const treeDepths = {
    intStateTreeDepth: 1,
    messageTreeDepth: 4,
    messageTreeSubDepth: 2,
    voteOptionTreeDepth: 2,
  };
  const stateTreeDepth = 10;
  const intStateTreeDepth = 1;
  const messageBatchSize = 25;
  const tallyBatchSize = 5 ** intStateTreeDepth;
  let maciState: MaciState;
  let tallyFileData: {
    maci: any;
    pollId: number;
    newTallyCommitment: any;
    results: {
      tally: any;
      salt: any;
    };
    totalSpentVoiceCredits: {
      spent: any;
      salt: any;
    };
    perVOSpentVoiceCredits: {
      tally: any;
      salt: any;
    };
  };

  beforeEach(async function () {
    this?.timeout(40000);
    [deployer, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();
    PoseidonT3Factory = new PoseidonT3__factory(deployer);
    PoseidonT4Factory = new PoseidonT4__factory(deployer);
    PoseidonT5Factory = new PoseidonT5__factory(deployer);
    PoseidonT6Factory = new PoseidonT6__factory(deployer);
    PoseidonT3 = await PoseidonT3Factory.deploy();
    PoseidonT4 = await PoseidonT4Factory.deploy();
    PoseidonT5 = await PoseidonT5Factory.deploy();
    PoseidonT6 = await PoseidonT6Factory.deploy();

    linkedLibraryAddresses = {
      ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: PoseidonT5.address,
      ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: PoseidonT3.address,
      ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: PoseidonT6.address,
      ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: PoseidonT4.address,
    };

    GrantRoundFactory = new GrantRoundFactory__factory({ ...linkedLibraryAddresses }, deployer);
    PollFactoryFactory = new PollFactory__factory({ ...linkedLibraryAddresses }, deployer);
    MessageAqFactoryFactory = new MessageAqFactory__factory({ ...linkedLibraryAddresses }, deployer);
    MessageAq_Factory = new AccQueueQuinaryMaci__factory({ ...linkedLibraryAddresses }, deployer);
    QFIFactory = new QFI__factory({ ...linkedLibraryAddresses }, deployer);
    VKRegistryFactory = new VkRegistry__factory(deployer);
    ConstantInitialVoiceCreditProxyFactory = new ConstantInitialVoiceCreditProxy__factory(deployer);
    FreeForAllGateKeeperFactory = new FreeForAllGatekeeper__factory(deployer);
    RecipientRegistryFactory = new OptimisticRecipientRegistry__factory(deployer);
    BaseERC20TokenFactory = new BaseERC20Token__factory(deployer);
    PollProcessorAndTallyerFactory = new PollProcessorAndTallyer__factory(deployer);
    MockVerifierFactory = new MockVerifier__factory(deployer);

    optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, deployerAddress);
    grantRoundFactory = await GrantRoundFactory.deploy();
    grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);
    pollFactory = await PollFactoryFactory.deploy();
    messageAqFactory = await MessageAqFactoryFactory.deploy();
    messageAqFactoryGrants = await MessageAqFactoryFactory.deploy();
    freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
    //NOTE: each user recieves 100 voice credits by default
    constantInitialVoiceCreditProxy = await ConstantInitialVoiceCreditProxyFactory.deploy(100);
    vkRegistry = await VKRegistryFactory.deploy();
    baseERC20Token = await BaseERC20TokenFactory.deploy(100);
    mockVerifier = await MockVerifierFactory.deploy();
    pollProcessorAndTallyer = await PollProcessorAndTallyerFactory.deploy(mockVerifier.address);

    qfi = await QFIFactory.deploy(
      baseERC20Token.address,
      grantRoundFactory.address,
      pollFactory.address,
      freeForAllGateKeeper.address,
      constantInitialVoiceCreditProxy.address
    );
    await pollFactory.transferOwnership(qfi.address);
    await grantRoundFactory.transferOwnership(qfi.address);
    await messageAqFactory.transferOwnership(pollFactory.address);
    await messageAqFactoryGrants.transferOwnership(grantRoundFactory.address);
    await qfi.initialize(vkRegistry.address, messageAqFactory.address, messageAqFactoryGrants.address);

    const stateTreeDepth = await qfi.stateTreeDepth();
    const _stateTreeDepth = stateTreeDepth.toString();
    const _intStateTreeDepth = 1;
    const _messageTreeDepth = 4;
    const _voteOptionTreeDepth = 2;
    const _messageBatchSize = 25;
    const _processVk = <VerifyingKeyStruct>testProcessVk.asContractParam();
    const _tallyVk = <VerifyingKeyStruct>testTallyVk.asContractParam();

    await vkRegistry.setVerifyingKeys(
      _stateTreeDepth,
      _intStateTreeDepth,
      _messageTreeDepth,
      _voteOptionTreeDepth,
      _messageBatchSize,
      _processVk,
      _tallyVk
    );

    await vkRegistry.genProcessVkSig(_stateTreeDepth, _messageTreeDepth, _voteOptionTreeDepth, _messageBatchSize);
    await vkRegistry.genTallyVkSig(_stateTreeDepth, _intStateTreeDepth, _voteOptionTreeDepth);
    coordinator = new Keypair();
    const coordinatorPubkey = coordinator.pubKey.asContractParam();

    // NOTE: Create new local maci data structure
    maciState = new MaciState();
    const provider = deployer.provider ?? ethers.getDefaultProvider();

    const userSigners = [user1, user2, user3];
    users = [];
    for (const user of userSigners) {
      const maciKey = new Keypair();
      const _pubKey = maciKey.pubKey.asContractParam();
      const _signUpGatekeeperData = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      const _initialVoiceCreditProxyData = ethers.utils.defaultAbiCoder.encode(["uint256"], [0]);

      const { logs } = await qfi
        .connect(user)
        .signUp(_pubKey, _signUpGatekeeperData, _initialVoiceCreditProxyData)
        .then((tx) => tx.wait());

      const iface = qfi.interface;
      const signUpEvent = iface.parseLog(logs[logs.length - 1]);
      const stateIndex = signUpEvent.args._stateIndex.toString();
      users.push({ maciKey: maciKey, signer: user, stateIndex: stateIndex });
      // NOTE: Signup users on local maci data structure
      maciState.signUp(
        maciKey.pubKey,
        BigInt(signUpEvent.args._voiceCreditBalance.toString()),
        BigInt(signUpEvent.args._timestamp.toString())
      );
    }

    const { blockHash } = await qfi
      .connect(deployer)
      .deployPoll(duration, maxValues, treeDepths, coordinatorPubkey, { gasLimit: 30000000 })
      .then((tx) => tx.wait());

    // NOTE: Deploy the poll on local maci data structure
    const deployTime = (await provider.getBlock(blockHash)).timestamp;
    //NOTE: this is where the coordinator key is set on the local maci data structure
    const p = maciState.deployPoll(
      duration,
      BigInt(deployTime + duration),
      maxValues,
      treeDepths,
      messageBatchSize,
      coordinator
    );
    const pollContractAddress = await qfi.getPoll(0);
    poll = new Poll__factory({ ...linkedLibraryAddresses }, deployer).attach(pollContractAddress);
    let index = 1;
    for (const user of users) {
      const { maciKey, signer, stateIndex } = user;
      const _stateIndex = BigInt(stateIndex);

      const _newPubKey = maciKey.pubKey;
      const _voteOptionIndex = BigInt(index);
      const _newVoteWeight = BigInt(index);
      const _nonce = BigInt(1);
      const _pollId = BigInt(0);
      const _salt = BigInt(1);
      const command = new Command(_stateIndex, _newPubKey, _voteOptionIndex, _newVoteWeight, _nonce, _pollId, _salt);

      const signature = command.sign(maciKey.privKey);
      const sharedKey = Keypair.genEcdhSharedKey(maciKey.privKey, coordinator.pubKey);
      const message = command.encrypt(signature, sharedKey);
      const _message = <MessageStruct>message.asContractParam();
      const _encPubKey = maciKey.pubKey.asContractParam();
      // NOTE: Publish the message on local maci data structure
      maciState.polls[0].publishMessage(message, maciKey.pubKey);
      const { logs } = await poll
        .connect(signer)
        .publishMessage(_message, _encPubKey)
        .then((tx) => tx.wait());
    }
    const overwrite = [...users];
    for (const user of overwrite) {
      const { maciKey, signer, stateIndex } = user;
      const _stateIndex = BigInt(stateIndex);
      const _newPubKey = maciKey.pubKey;
      const _voteOptionIndex = BigInt(index);
      const _newVoteWeight = BigInt(index);
      const _nonce = BigInt(2);
      const _pollId = BigInt(0);
      const _salt = BigInt(2);
      const command = new Command(_stateIndex, _newPubKey, _voteOptionIndex, _newVoteWeight, _nonce, _pollId, _salt);
      index++;

      const signature = command.sign(maciKey.privKey);
      const sharedKey = Keypair.genEcdhSharedKey(maciKey.privKey, coordinator.pubKey);
      const message = command.encrypt(signature, sharedKey);
      const _message = <MessageStruct>message.asContractParam();
      const _encPubKey = maciKey.pubKey.asContractParam();
      // NOTE: Publish the message on local maci data structure
      maciState.polls[0].publishMessage(message, maciKey.pubKey);
      const { logs, blockHash } = await poll
        .connect(signer)
        .publishMessage(_message, _encPubKey)
        .then((tx) => tx.wait());
      // const currentTime = (await provider.getBlock(blockHash)).timestamp;
    }

    const dd = await poll.getDeployTimeAndDuration();
    const hardHatProvider = ethers.provider;
    await hardHatProvider.send("evm_increaseTime", [dd[1].toNumber() + 1]);
    await hardHatProvider.send("evm_mine", []);
    const extContracts = await poll.extContracts();

    const messageAqAddress = extContracts.messageAq;
    messageAq = MessageAq_Factory.attach(messageAqAddress);

    const maciPoll = maciState.polls[0];
    maciPoll.messageAq.mergeSubRoots(0); //NOTE: 0 as input attempts to merge all subroots
    maciPoll.messageAq.merge(treeDepths.messageTreeDepth);

    await poll.mergeMessageAqSubRoots(0);
    await poll.mergeMessageAq();

    const maciStateAq = maciState.stateAq;
    maciStateAq.mergeSubRoots(0); // 0 as input attempts to merge all subroots
    maciStateAq.merge(stateTreeDepth);

    await poll.mergeMaciStateAqSubRoots(0, 0);
    await poll.mergeMaciStateAq(0);
  });

  describe("Maci state calculations", () => {
    it("verify - correctly packs maximumVoteOptions, numsignups, currentMessageBatchIndex, indexOfCurrentBatch into a 250-bit value", async () => {
      const pollId = 0;
      const maciPoll = maciState.polls[pollId];

      //TODO: do we need large vals?
      const expectedPackedVals = MaciState.packProcessMessageSmallVals(
        maxValues.maxVoteOptions,
        users.length,
        0,
        maciPoll.messages.length
      );
      const onChainPackedVals = await pollProcessorAndTallyer.genProcessMessagesPackedVals(
        poll.address,
        BigNumber.from(0),
        users.length
      );
      expect(expectedPackedVals.toString()).to.equal(onChainPackedVals.toString());
    });
    it("verify - correctly packs the batch start index and number of signups into a 100-bit value", async () => {
      const maciExpectedPackedVals = MaciState.packTallyVotesSmallVals(0, tallyBatchSize, users.length);
      const onChainPackedVals = await pollProcessorAndTallyer.genTallyVotesPackedVals(users.length, 0, tallyBatchSize);
      expect(onChainPackedVals.toString()).to.equal(maciExpectedPackedVals.toString());
    });
  });

  describe("Process and Tally Vote messages", () => {
    it("verify - process messages and proof", async () => {
      const pollId = 0;
      const maciPoll = maciState.polls[pollId];
      //NOTE: new state root and ballot root commitment calculated off chain
      const { newSbCommitment: maciNewSbCommitment } = maciPoll.processMessages(pollId);
      //TODO: why does this work?
      const dummyProof: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ] = [0, 0, 0, 0, 0, 0, 0, 0];
      const { status } = await pollProcessorAndTallyer
        .processMessages(poll.address, maciNewSbCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(status).to.equal(1);
      expect(await pollProcessorAndTallyer.processingComplete()).to.be.true;

      const onChainNewSbCommitment = await pollProcessorAndTallyer.sbCommitment();
      expect(maciNewSbCommitment).to.equal(onChainNewSbCommitment.toString());
    });

    it("verify - tally proof is valid and updates tally commitment on chain", async () => {
      const pollId = 0;
      const maciPoll = maciState.polls[pollId];
      //NOTE: new state root and ballot root commitment calculated off chain
      const { newSbCommitment: maciNewSbCommitment } = maciPoll.processMessages(pollId);
      //TODO: why does this work?
      const dummyProof: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ] = [0, 0, 0, 0, 0, 0, 0, 0];
      const { status: processMessagesStatus } = await pollProcessorAndTallyer
        .processMessages(poll.address, maciNewSbCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(processMessagesStatus).to.equal(1);
      expect(await pollProcessorAndTallyer.processingComplete()).to.be.true;

      const maciGeneratedInputs = maciPoll.tallyVotes(pollId);
      const { status: tallyVotesStatus } = await pollProcessorAndTallyer
        .tallyVotes(poll.address, maciGeneratedInputs.newTallyCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(tallyVotesStatus).to.equal(1);

      const onChainNewTallyCommitment = await pollProcessorAndTallyer.tallyCommitment();
      expect(maciGeneratedInputs.newTallyCommitment).to.equal(onChainNewTallyCommitment);
    });

    it("require fail - Fails if there are no untallied ballots left", async () => {
      const pollId = 0;
      const maciPoll = maciState.polls[pollId];
      //NOTE: new state root and ballot root commitment calculated off chain
      const { newSbCommitment: maciNewSbCommitment } = maciPoll.processMessages(pollId);
      //TODO: why does this work?
      const dummyProof: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ] = [0, 0, 0, 0, 0, 0, 0, 0];
      const { status: processMessagesStatus } = await pollProcessorAndTallyer
        .processMessages(poll.address, maciNewSbCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(processMessagesStatus).to.equal(1);
      expect(await pollProcessorAndTallyer.processingComplete()).to.be.true;

      const maciGeneratedInputs = maciPoll.tallyVotes(pollId);
      const { status: tallyVotesStatus } = await pollProcessorAndTallyer
        .tallyVotes(poll.address, maciGeneratedInputs.newTallyCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(tallyVotesStatus).to.equal(1);
      const onChainNewTallyCommitment = await pollProcessorAndTallyer.tallyCommitment();

      expect(maciGeneratedInputs.newTallyCommitment).to.equal(onChainNewTallyCommitment);

      await expect(
        pollProcessorAndTallyer.tallyVotes(poll.address, maciGeneratedInputs.newTallyCommitment, dummyProof)
      ).to.be.revertedWith("PptE08");
    });

    it("verify - generates tally file data", async () => {
      const pollId = 0;
      const maciPoll = maciState.polls[pollId];
      //NOTE: new state root and ballot root commitment calculated off chain
      const { newSbCommitment: maciNewSbCommitment } = maciPoll.processMessages(pollId);
      //TODO: why does this work?
      const dummyProof: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ] = [0, 0, 0, 0, 0, 0, 0, 0];

      const { status: processMessagesStatus } = await pollProcessorAndTallyer
        .processMessages(poll.address, maciNewSbCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(processMessagesStatus).to.equal(1);
      expect(await pollProcessorAndTallyer.processingComplete()).to.be.true;

      const maciTallyCircuitInputs = maciPoll.tallyVotes(pollId);
      const { status: tallyVotesStatus } = await pollProcessorAndTallyer
        .tallyVotes(poll.address, maciTallyCircuitInputs.newTallyCommitment, dummyProof)
        .then((tx) => tx.wait());
      expect(tallyVotesStatus).to.equal(1);

      const onChainNewTallyCommitment = await pollProcessorAndTallyer.tallyCommitment();
      expect(maciTallyCircuitInputs.newTallyCommitment).to.equal(onChainNewTallyCommitment);

      await expect(
        pollProcessorAndTallyer.tallyVotes(poll.address, maciTallyCircuitInputs.newTallyCommitment, dummyProof)
      ).to.be.revertedWith("PptE08"); //NOTE: should not be any votes left to tally

      const newTallyCommitment = maciTallyCircuitInputs.newTallyCommitment;
      const tallyResults = maciPoll.results.map((x: any) => x.toString());
      const tallySalt = maciTallyCircuitInputs.newResultsRootSalt;
      const voiceCreditsSpent = maciPoll.totalSpentVoiceCredits.toString();
      const voiceCreditsSalt = maciTallyCircuitInputs.newSpentVoiceCreditSubtotalSalt;
      const perVOSpentTally = maciPoll.perVOSpentVoiceCredits.map((x: any) => x.toString());
      const perVOSpentSalt = maciTallyCircuitInputs.newPerVOSpentVoiceCreditsRootSalt;
      tallyFileData = {
        maci: qfi.address,
        pollId: pollId,
        newTallyCommitment: newTallyCommitment,
        results: {
          tally: tallyResults,
          salt: tallySalt,
        },
        totalSpentVoiceCredits: {
          spent: voiceCreditsSpent,
          salt: voiceCreditsSalt,
        },
        perVOSpentVoiceCredits: {
          tally: perVOSpentTally,
          salt: perVOSpentSalt,
        },
      };
      Object.values(tallyFileData).forEach((value) => {
        expect(value).to.not.be.undefined;
      });
      Object.values(tallyFileData).forEach((value) => {
        expect(value).to.not.be.undefined;
      });
      expect(maciPoll.hasUntalliedBallots()).to.equal(false);
      expect(maciPoll.hasUnprocessedMessages()).to.equal(false);
      expect(maciPoll.messages.length).to.be.equal(users.length * 2); //every user sends an overide message
    });
  });
});
