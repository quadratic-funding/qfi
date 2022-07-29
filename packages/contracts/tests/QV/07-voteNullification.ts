import { ethers } from "hardhat";
import { BigNumber, BigNumberish, Signer } from "ethers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Command, Keypair, Message, VerifyingKey, PrivKey, PubKey } from "qaci-domainobjs";
import { G1Point, G2Point, hash5, hashLeftRight, IncrementalQuinTree } from "qaci-crypto";
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
import {
  AccQueue,
  AccQueueQuinaryBlankSl__factory,
  AccQueueQuinaryMaci__factory,
  AccQueue__factory,
} from "../../typechain";

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

describe("Process - Tally QV poll votes", function () {
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
  let user11: Signer;
  let user12: Signer;
  let user13: Signer;
  let user14: Signer;
  let user15: Signer;
  let user16: Signer;
  let user17: Signer;
  let user18: Signer;
  let user19: Signer;
  let user20: Signer;
  let user21: Signer;
  let user22: Signer;
  let user23: Signer;
  let user24: Signer;
  let user25: Signer;
  let user26: Signer;

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

  let AccQueueFactory: AccQueueQuinaryMaci__factory;

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
  let stateAq: AccQueueQuinaryMaci;

  let users: {
    maciKey: Keypair;
    signer: Signer;
    stateIndex: number;
  }[] = [];

  const STATE_TREE_DEPTH = 10;
  const STATE_TREE_ARITY = 5;
  const MESSAGE_TREE_ARITY = 5;

  const duration = 6000;

  const treeDepths = {
    intStateTreeDepth: 3, //NOTE: actualy use tally batch size of 25
    messageTreeDepth: 4,
    messageTreeSubDepth: 2,
    voteOptionTreeDepth: 2,
  };

  const messageBatchSize = MESSAGE_TREE_ARITY ** treeDepths.messageTreeSubDepth;
  const tallyBatchSize = STATE_TREE_ARITY ** treeDepths.intStateTreeDepth;

  const maxValues = {
    maxUsers: STATE_TREE_ARITY ** STATE_TREE_DEPTH,
    maxMessages: MESSAGE_TREE_ARITY ** treeDepths.messageTreeDepth,
    maxVoteOptions: MESSAGE_TREE_ARITY ** treeDepths.voteOptionTreeDepth,
  };

  let maciState: MaciState;
  let tallyFileData: {
    maci: string;
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
  let maciNewSbCommitment: any;

  beforeEach(async function () {
    this?.timeout(400000);
    expect(maxValues.maxMessages % messageBatchSize == 0).to.be.true;

    [
      deployer,
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
      user12,
      user13,
      user14,
      user15,
      user16,
      user17,
      user18,
      user19,
      user20,
      user21,
      user22,
      user23,
      user24,
      user25,
      user26,
    ] = await ethers.getSigners();
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
    AccQueueFactory = new AccQueueQuinaryBlankSl__factory({ ...linkedLibraryAddresses }, deployer);
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
    const _intStateTreeDepth = treeDepths.intStateTreeDepth;
    const _messageTreeDepth = treeDepths.messageTreeDepth;
    const _voteOptionTreeDepth = treeDepths.voteOptionTreeDepth;
    const _messageBatchSize = messageBatchSize.toString();
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

    const userSigners = [
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
      user12,
      user13,
      user14,
      user15,
      user16,
      user17,
      user18,
      user19,
      user20,
      user21,
      user22,
      user23,
      user24,
      user25,
      user26,
    ];
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
    const pollId = p.toString();
    const pollContractAddress = await qfi.getPoll(0);
    poll = new Poll__factory({ ...linkedLibraryAddresses }, deployer).attach(pollContractAddress);

    let index = 1;
    for (const user of users) {
      const { maciKey, signer, stateIndex } = user;
      const _stateIndex = BigInt(stateIndex);
      const _newPubKey = maciKey.pubKey;
      const _voteOptionIndex = BigInt(24);
      const _newVoteWeight = BigInt(2);
      const _nonce = BigInt(1);
      const _pollId = BigInt(0);
      const _salt = BigInt(1);
      const command = new Command(_stateIndex, _newPubKey, _voteOptionIndex, _newVoteWeight, _nonce, _pollId, _salt);
      index++;

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
    index = 1;
    const overwrite = [...users];
    for (const user of overwrite) {
      const { maciKey, signer, stateIndex } = user;
      const _stateIndex = BigInt(stateIndex);
      const _newPubKey = maciKey.pubKey;
      const _voteOptionIndex = BigInt(0);
      const _newVoteWeight = BigInt(1);
      const _nonce = BigInt(1);
      const _pollId = BigInt(0);
      const _salt = BigInt(1);
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

      const currentTime = (await provider.getBlock(blockHash)).timestamp;
    }

    index = 0;
    const overwrite2 = [...users];
    for (const user of overwrite2) {
      const { maciKey, signer, stateIndex } = user;
      const _stateIndex = BigInt(stateIndex);
      const _newPubKey = maciKey.pubKey;
      const _voteOptionIndex = BigInt(index % 25);
      const _newVoteWeight = BigInt(10);
      const _nonce = BigInt(1);
      const _pollId = BigInt(0);
      const _salt = BigInt(1);
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

      const currentTime = (await provider.getBlock(blockHash)).timestamp;
    }
    const [_deployTime, _duration] = await poll.getDeployTimeAndDuration();
    const hardHatProvider = ethers.provider;
    await hardHatProvider.send("evm_setNextBlockTimestamp", [_duration.toNumber() +_deployTime.toNumber() + 1]);
    await hardHatProvider.send("evm_mine", []);

    const extContracts = await poll.extContracts();

    //==========Merge the state and message Merkle Trees on and offchain ========== //
    console.log("Merging the state and message Merkle Trees on and offchain");
    //NOTE: Merge state tree offchain
    const maciStateAq = maciState.stateAq;
    maciStateAq.mergeSubRoots(0); // 0 as input attempts to merge all subroots
    maciStateAq.merge(stateTreeDepth);

    //NOTE: Merge state tree onchain
    const stateAqAddress = await qfi.stateAq();
    stateAq = await AccQueueFactory.attach(stateAqAddress);
    while ((await stateAq.subTreesMerged()) != true) {
      await poll.mergeMaciStateAqSubRoots(0, 0); //call untill all subtrees are merged
      const numLeaves = await stateAq.numLeaves();
      const subTreeMerged = await stateAq.subTreesMerged(); //white false merge subroots again
      console.log("numstateAqLeaves: " + numLeaves);
      console.log("numstateAqSubTreeMerged: " + subTreeMerged);
    }
    await poll.mergeMaciStateAq(0); //only have to call once

    //NOTE: Merge message tree offchain
    const maciPoll = maciState.polls[0];
    maciPoll.messageAq.mergeSubRoots(0); //NOTE: 0 as input attempts to merge all subroots
    maciPoll.messageAq.merge(treeDepths.messageTreeDepth);

    //NOTE: Merge message tree onchain
    const messageAqAddress = extContracts.messageAq;
    messageAq = MessageAq_Factory.attach(messageAqAddress);
    while ((await messageAq.subTreesMerged()) != true) {
      await poll.mergeMessageAqSubRoots(0);
      const numLeaves = await stateAq.numLeaves();
      const subTreeMerged = await stateAq.subTreesMerged(); //white false merge subroots again
      console.log("numMessageAqLeaves: " + numLeaves);
      console.log("numMessageAqSubTreeMerged: " + subTreeMerged);
    }
    console.log(await messageAq.subTreesMerged());
    await poll.mergeMessageAq();

    //========== ProcessMessagesCircuit Magik offchain ===========//
    console.log("ProcessMessagesCircuit");

    //NOTE: Circuit input generation offchain
    const processMessagesCircuitInputsByBatch = [];
    while (maciPoll.hasUnprocessedMessages()) {
      const circuitInputs = maciPoll.processMessages(pollId); //Process _batchSize messages starting from the saved index.

      //NOTE: new state root and ballot root commitment calculated off chain
      const newSbCommitment = circuitInputs.newSbCommitment;
      console.log("Batch" + maciPoll.currentMessageBatchIndex + ": newSbCommitment" + newSbCommitment);
      processMessagesCircuitInputsByBatch.push(circuitInputs);
    }

    //NOTE: Proof Generation offchain
    const processMessagesVerifierInputsByBatch = processMessagesCircuitInputsByBatch.map(
      (circuitInputs, batchNumber) => {
        //NOTE: these are required for the Verifier Contract onchain
        const proof = coordinatorServiceFetchProcessMessageProof(pollContractAddress, batchNumber);
        const maciNewSbCommitment = circuitInputs.newSbCommitment;
        const pollAddress = pollContractAddress;
        return {
          pollAddress,
          maciNewSbCommitment,
          proof,
        };
      }
    );

    //========== ProcessMessagesCircuit Magik onchain ===========//

    //NOTE: Process messages onchain and verify proof using VkRegistry
    const onchainProcessMessagesOk = processMessagesVerifierInputsByBatch.map(async (verifierInputs, batchNumber) => {
      const { pollAddress, maciNewSbCommitment, proof } = verifierInputs;
      console.log("Processing Batch" + batchNumber + " of messages onChain");
      try {
        //SNARK verification onchain
        await pollProcessorAndTallyer.processMessages(pollAddress, maciNewSbCommitment, proof);
        return true;
      } catch (e) {
        console.log(batchNumber);
        return false;
      }
    });
    const allOnchainProcessMessagesOk = (await Promise.all(onchainProcessMessagesOk)).reduce((a, b) => a && b);

    expect(allOnchainProcessMessagesOk).to.be.true;

    const processingComplete = await pollProcessorAndTallyer.processingComplete();
    expect(processingComplete).to.be.true;

    //========== TallyVotesCircuit Magik offchain ===========//
    console.log("TallyVotesCircuit");

    //NOTE: Circuit input generation offchain
    const tallyVotesCircuitInputsByBatch = [];
    while (maciPoll.hasUntalliedBallots()) {
      const circuitInputs = maciPoll.tallyVotes(); //Process _batchSize ballots starting from the saved index.

      //NOTE: new stally commitment calculated off chain
      const newTallyCommitment = circuitInputs.newTallyCommitment;

      console.log("Batch" + maciPoll.numBatchesTallied + ": newTallyCommitment" + newTallyCommitment);

      tallyVotesCircuitInputsByBatch.push(circuitInputs);
      console.log("/=========TALLY SO FAR==========/");
      console.log(maciPoll.results.map((x: any) => x.toString()));
      console.log("/=========TALLY SO FAR==========/");
    }

    //NOTE: Proof Generation offchain
    const tallyVotesVerifierInputsByBatch = tallyVotesCircuitInputsByBatch.map((circuitInputs, batchNumber) => {
      //NOTE: these are required for the Verifier Contract onchain

      const proof = coordinatorServiceFetchTallyVoteProof(pollContractAddress, batchNumber);
      const newTallyCommitment = circuitInputs.newTallyCommitment;
      const newResultsRootSalt = circuitInputs.newResultsRootSalt;
      const newSpentVoiceCreditSubtotalSalt = circuitInputs.newSpentVoiceCreditSubtotalSalt;
      const newPerVOSpentVoiceCreditsRootSalt = circuitInputs.newPerVOSpentVoiceCreditsRootSalt;
      const pollAddress = pollContractAddress;

      return {
        pollAddress,
        newTallyCommitment,
        proof,
        newResultsRootSalt,
        newSpentVoiceCreditSubtotalSalt,
        newPerVOSpentVoiceCreditsRootSalt,
      };
    });

    //========== TallyVotesCircuit Magik onchain ===========//

    //NOTE: TallyVotes onchain and verify proof using VkRegistry
    const onChainTallyOk = tallyVotesVerifierInputsByBatch.map(async (verifierInputs, batchNumber) => {
      const { pollAddress, newTallyCommitment, proof } = verifierInputs;
      console.log("Processing Batch" + batchNumber + " of messages onChain");

      try {
        //SNARK verification onchain
        await pollProcessorAndTallyer.tallyVotes(pollAddress, newTallyCommitment, proof);
        return true;
      } catch (e) {
        console.log(batchNumber);
        return false;
      }
    });
    console.log("🎉");
    console.log(tallyVotesVerifierInputsByBatch);

    const onChainTallyAllOk = (await Promise.all(onChainTallyOk)).reduce((a, b) => a && b);
    expect(onChainTallyAllOk).to.be.true;

    const { tallyBatchSize: finalTallybatchSize } = await poll.batchSizes();
    const finalBatchStartIndex = (await pollProcessorAndTallyer.tallyBatchNum()).toNumber() * finalTallybatchSize;
    const [finalNumSignups] = await poll.numSignUpsAndMessages();
    expect(finalBatchStartIndex).to.be.greaterThanOrEqual(finalNumSignups.toNumber());

    //========== Generate Tally File Data ===========//

    const finalProcessMessagesCircuitInputs =
      processMessagesCircuitInputsByBatch[processMessagesCircuitInputsByBatch.length - 1];
    const finalTallyCircuitInputs = tallyVotesVerifierInputsByBatch[tallyVotesVerifierInputsByBatch.length - 1];

    maciNewSbCommitment = finalProcessMessagesCircuitInputs.newSbCommitment;

    const newTallyCommitment = finalTallyCircuitInputs.newTallyCommitment;
    const tallyResults = maciPoll.results.map((x: any) => x.toString());
    const tallySalt = finalTallyCircuitInputs.newResultsRootSalt;
    const voiceCreditsSpent = maciPoll.totalSpentVoiceCredits.toString();
    const voiceCreditsSalt = finalTallyCircuitInputs.newSpentVoiceCreditSubtotalSalt;
    const perVOSpentTally = maciPoll.perVOSpentVoiceCredits.map((x: any) => x.toString());
    const perVOSpentSalt = finalTallyCircuitInputs.newPerVOSpentVoiceCreditsRootSalt;
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
    console.log(tallyFileData);
  });

  describe("Verify vote nullification and verify maci state", () => {
    it("verify - sanity checks", async () => {
      // prettier-ignore
      const expectedResultsTally = [
        '20', '10', '10', '10', '10',  '10',
        '10', '10', '10', '10', '10', '10',
        '10', '10', '10', '10', '10',  '10',
        '10', '10', '10', '10', '10',  '10',
        '10'
      ];
      expect(tallyFileData.results.tally).to.deep.equal(expectedResultsTally);

      // prettier-ignore
      const expectedPerVOSpentVoiceCredits = [
        '200', '100', '100', '100', '100',
        '100', '100', '100', '100', '100',
        '100', '100', '100', '100', '100',
        '100', '100', '100', '100', '100',
        '100', '100', '100', '100', '100'
      ];
      expect(tallyFileData.perVOSpentVoiceCredits.tally).to.deep.equal(expectedPerVOSpentVoiceCredits);

      // prettier-ignore
      const expectedTotalSpentVoiceCredits = [
        '200', '100', '100', '100', '100',
        '100', '100', '100', '100', '100',
        '100', '100', '100', '100', '100',
        '100', '100', '100', '100', '100',
        '100', '100', '100', '100', '100'
      ].reduce(((acc, x) => acc + Number(x)), 0).toString();
      expect(tallyFileData.totalSpentVoiceCredits.spent).to.deep.equal(expectedTotalSpentVoiceCredits);

      const stateAqMerged = await poll.stateAqMerged();
      expect(stateAqMerged).to.be.true;

      const processingComplete = await pollProcessorAndTallyer.processingComplete();
      expect(processingComplete).to.be.true;

      const { intStateTreeDepth, messageTreeSubDepth, messageTreeDepth, voteOptionTreeDepth } = await poll.treeDepths();
      expect(intStateTreeDepth).to.be.equal(treeDepths.intStateTreeDepth);
      expect(messageTreeDepth).to.be.equal(treeDepths.messageTreeDepth);
      expect(messageTreeSubDepth).to.be.equal(treeDepths.messageTreeSubDepth);
      expect(voteOptionTreeDepth).to.be.equal(treeDepths.voteOptionTreeDepth);

      const [numSignUps, numMessages] = await poll.numSignUpsAndMessages();
      expect(numSignUps).to.be.equal(26);
      expect(numMessages).to.be.equal(78);

      const [maxMessages, maxVoteOptions] = await poll.maxValues();
      expect(maxVoteOptions).to.be.equal(maxValues.maxVoteOptions);
      expect(maxMessages).to.be.equal(maxValues.maxMessages);

      const [_messageBatchSize, _tallyBatchSize] = await poll.batchSizes();
      expect(_messageBatchSize).to.be.equal(messageBatchSize);
      expect(_tallyBatchSize).to.be.equal(tallyBatchSize);

      const mergedStateRootPoll = await poll.mergedStateRoot();
      const mergedStateRootMACI = await qfi.getStateAqRoot();
      const expectedStateTreeRoot = maciState.polls[0].maciStateRef.stateTree.root;
      expect(mergedStateRootPoll).to.not.be.equal(BigNumber.from(0));
      expect(mergedStateRootMACI).to.not.be.equal(BigNumber.from(0));
      expect(expectedStateTreeRoot).to.not.be.equal(BigNumber.from(0));
      expect(mergedStateRootPoll).to.be.equal(mergedStateRootMACI); // MACI state root is the same as the poll state root
      expect(mergedStateRootPoll).to.be.equal(expectedStateTreeRoot); // MACI state root is the same as the one calculated offchain

      const pptsbCommitment = await pollProcessorAndTallyer.sbCommitment();
      const expectedSbCommitment = maciNewSbCommitment;
      expect(pptsbCommitment).to.not.be.equal(BigNumber.from(0));
      expect(expectedSbCommitment).to.not.be.equal(BigNumber.from(0));
      expect(pptsbCommitment).to.be.equal(expectedSbCommitment); // pollProcessorAndTallyer sbCommitment is the same as the one calculated offchain

      const pollCurrentSbCommitment = await poll.currentSbCommitment();
      console.log(`poll_SbCommitment: ${pollCurrentSbCommitment}`);
      console.log(`pollProcessorAndTallyer_SbCommitment: ${pptsbCommitment}`);
      console.log(`expectedSbCommitment: ${expectedSbCommitment}`);
      expect(pollCurrentSbCommitment).to.not.be.equal(BigNumber.from(0));
      expect(pptsbCommitment).to.not.be.equal(BigNumber.from(0));
      expect(expectedSbCommitment).to.not.be.equal(BigNumber.from(0));
      expect(pptsbCommitment).to.be.equal(expectedSbCommitment);
      expect(pollCurrentSbCommitment).to.not.be.equal(pptsbCommitment); // poll sbCommitment is not the same as the one calculated on state

      const mergedMessageRoot = await messageAq.getMainRoot(treeDepths.messageTreeDepth);
      const expectedMessageTreeRoot = maciState.polls[0].messageTree.root;
      expect(mergedMessageRoot).to.not.be.equal(BigNumber.from(0));
      expect(expectedMessageTreeRoot).to.not.be.equal(BigNumber.from(0));
      expect(mergedMessageRoot).to.be.equal(expectedMessageTreeRoot); // MACI message root is the same as the one calculated offchain

      const tallyCommitment = await pollProcessorAndTallyer.tallyCommitment();
      const expectedTallyCommitment = tallyFileData.newTallyCommitment;
      expect(tallyCommitment).to.not.be.equal(BigNumber.from(0));
      expect(expectedTallyCommitment).to.not.be.equal(BigNumber.from(0));
      expect(tallyCommitment).to.be.equal(expectedTallyCommitment); // pollProcessorAndTallyer tallyCommitment is the same as the one calculated offchain
    });
  });

  describe("verify: claimAll", () => {
    it("verify - poll SHOULD verifyTallyResult", async () => {
      // Setup
      const recipientIndex = 1;
      const resultTree = new IncrementalQuinTree(treeDepths.voteOptionTreeDepth, BigInt(0), STATE_TREE_ARITY, hash5);
      const perVOspentTree = new IncrementalQuinTree( treeDepths.voteOptionTreeDepth, BigInt(0), STATE_TREE_ARITY, hash5); // prettier-ignore

      for (const leaf of tallyFileData.results.tally) resultTree.insert(leaf); // insert resuls tally as leaves
      for (const leaf of tallyFileData.perVOSpentVoiceCredits.tally) perVOspentTree.insert(leaf); // insert perVO spent as leaves

      const resultProof = resultTree.genMerklePath(recipientIndex); // generate merkle path for result
      const spentProof = perVOspentTree.genMerklePath(recipientIndex); // generate merkle path for spent

      expect(resultTree.root).to.be.equal(resultProof.root); // verify result tree root
      expect(perVOspentTree.root).to.be.equal(spentProof.root); // verify spent tree root

      // Calculate arguments
      const _voteOptionIndex = recipientIndex;
      const _tallyResult = tallyFileData.results.tally[recipientIndex]; // result of the recipient
      const _tallyResultSalt = tallyFileData.results.salt;
      const _tallyResultProof = resultProof.pathElements.map((x: any) => x.map((y: any) => y.toString())); // result proof as astring
      const _spentVoiceCreditsHash = BigNumber.from(
        hashLeftRight(
          BigInt(tallyFileData.totalSpentVoiceCredits.spent),
          BigInt(tallyFileData.totalSpentVoiceCredits.salt)
        ).toString()
      ).toString();
      const _perVOSpentVoiceCreditsHash = BigNumber.from(
        hashLeftRight(
          perVOspentTree.root, 
          BigInt(tallyFileData.perVOSpentVoiceCredits.salt)).toString()
      ).toString(); // prettier-ignore
      const _tallyCommitment = BigNumber.from(tallyFileData.newTallyCommitment).toString();

      console.log(`_tallyResultProof: ${_tallyResultProof}`);
      console.log(`_tallyResult: ${_tallyResult}`);
      console.log(`_voteOptionIndex: ${_voteOptionIndex}`);
      console.log(`_spentVoiceCreditsHash: ${_spentVoiceCreditsHash}`);
      console.log(`_perVOSpentVoiceCreditsHash: ${_perVOSpentVoiceCreditsHash}`);
      console.log(`_tallyCommitment: ${_tallyCommitment}`);

      // * @param _voteOptionIndex the index of the vote option to verify the correctness of the tally
      // * @param _tallyResult Flattened array of the tally
      // * @param _tallyResultProof Corresponding proof of the tally result
      // * @param _tallyResultSalt the respective salt in the results object in the tally.json
      // * @param _spentVoiceCreditsHash hashLeftRight(number of spent voice credits, spent salt)
      // * @param _perVOSpentVoiceCreditsHash hashLeftRight(merkle root of the no spent voice credits per vote option, perVOSpentVoiceCredits salt)
      // * @param _tallyCommitment newTallyCommitment field in the tally.json
      expect(
        await poll.verifyTallyResult(
          _voteOptionIndex,
          _tallyResult,
          _tallyResultProof,
          _tallyResultSalt,
          _spentVoiceCreditsHash,
          _perVOSpentVoiceCreditsHash,
          _tallyCommitment
        )
      ).to.be.true;
    });
  });
});

function coordinatorServiceGenProof(circuitInputs: any, pollId: any, pubKey: PubKey, privKey: PrivKey) {
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
  return dummyProof;
}

function coordinatorServiceFetchProcessMessageProof(pollContractAddress, batchNumber) {
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
  return dummyProof;
}

function coordinatorServiceFetchTallyVoteProof(pollContractAddress, batchNumber) {
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
  return dummyProof;
}
