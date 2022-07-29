import { ethers } from "hardhat";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";
import { Signer, ContractTransaction, BigNumberish, constants } from "ethers";
import {
  deployMockContract,
  MockContract,
} from "@ethereum-waffle/mock-contract";
import {
  GrantRound,
  GrantRound__factory,
  PoseidonT3__factory,
  PoseidonT4__factory,
  PoseidonT5__factory,
  PoseidonT6__factory,
  BaseERC20Token__factory,
  VkRegistry__factory,
  OptimisticRecipientRegistry__factory,
  QFI__factory,
  AccQueue__factory,
  AccQueueQuinaryBlankSl__factory
} from "../../typechain";
import { Command, Keypair } from "qaci-domainobjs";
import { MessageStruct } from "../../typechain/GrantRound";
import { hash4, hash5 } from "qaci-crypto";

chai.use(solidity);
const { expect } = chai;

// Unit tests for Grant Round smart contract.
describe("Grant Round", () => {
  // Signers.
  let deployer: Signer;
  let voter: Signer;
  let voterAddress: string;
  let recipient: Signer;
  let recipientAddress: string;
  const voterMaciKeypair = new Keypair();
  let coordinator: Signer;
  let coordinatorAddress: string;
  const coordinatorMaciPublicKey = new Keypair().pubKey;

  // Grant Round instance.
  let grantRound: GrantRound;

  // Mock contracts.
  let mockBaseERC20Token: MockContract;
  let mockVkRegistry: MockContract;
  let mockRecipientRegistry: MockContract;
  let mockQfi: MockContract;
  let mockMessageAq: MockContract;
  let mockMaciStateAq: MockContract;

  // Pre-computed data.
  const decimals = 5;
  const voiceCreditFactor =
    (BigInt(10 ** 4) * BigInt(10 ** decimals)) / BigInt(10 ** 9);

  // Input parameters for GrantRound methods.
  // Deploy Grant Round.
  const duration = 300;
  const maxValues = {
    maxMessages: 25,
    maxVoteOptions: 25,
  };
  const treeDepths = {
    intStateTreeDepth: 2,
    messageTreeDepth: 2,
    messageTreeSubDepth: 2,
    voteOptionTreeDepth: 2,
  };
  const defaultMessageTreeArity = 5;
  const defaultStateTreeArity = 5;
  const batchSizes = {
    messageBatchSize: defaultMessageTreeArity ** treeDepths.messageTreeSubDepth,
    tallyBatchSize: defaultStateTreeArity ** treeDepths.intStateTreeDepth,
  };
  let extContracts: {
    vkRegistry: string;
    maci: string;
    messageAq: string;
  };
  // Messages.
  let message: MessageStruct;
  let hashMessangeAndEncPubKey: BigInt;
  // Finalize.
  // TODO: we need the correct totalSpent and totalSpentSalt values. There's a known bug about
  // the verifySpentVoiceCredits() method. So, just for now let's make test fail w/ some random values
  // because we are on Grant Round contract and we cannot mock these values.
  const tallyResults = {
    totalSpent: 9,
    totalSpentSalt: BigInt(999999999999),
  };

  beforeEach(async () => {
    // Get signers.
    [deployer, voter, coordinator, recipient] = await ethers.getSigners();
    voterAddress = await voter.getAddress();
    coordinatorAddress = await coordinator.getAddress();
    recipientAddress = await recipient.getAddress();

    // Mocked contracts.
    mockBaseERC20Token = await deployMockContract(deployer, BaseERC20Token__factory.abi);
    mockRecipientRegistry = await deployMockContract(
      deployer,
      OptimisticRecipientRegistry__factory.abi
    );
    mockQfi = await deployMockContract(deployer, QFI__factory.abi);
    mockMessageAq = await deployMockContract(deployer, AccQueue__factory.abi);
    mockVkRegistry = await deployMockContract(deployer, VkRegistry__factory.abi);
    mockMaciStateAq = await deployMockContract(
      deployer,
      AccQueueQuinaryBlankSl__factory.abi
    );

    // External contracts for Grant Round.
    extContracts = {
      vkRegistry: mockVkRegistry.address,
      maci: mockQfi.address,
      messageAq: mockMessageAq.address,
    };

    // Poseidon libraries.
    const poseidonT3 = await deployContract(deployer, PoseidonT3__factory, []);
    const poseidonT4 = await deployContract(deployer, PoseidonT4__factory, []);
    const poseidonT5 = await deployContract(deployer, PoseidonT5__factory, []);
    const poseidonT6 = await deployContract(deployer, PoseidonT6__factory, []);

    // nb. workaround due it's not possible to use Waffle library for linking libraries.
    // ISSUE -> https://github.com/EthWorks/Waffle/issues/429.
    const GrantRoundFactory = new GrantRound__factory(
      {
        ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]:
          poseidonT5.address,
        ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]:
          poseidonT3.address,
        ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]:
          poseidonT6.address,
        ["qaci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]:
          poseidonT4.address,
      },
      deployer
    );

    // Deploy Grant Round.
    grantRound = await GrantRoundFactory.deploy(
      voiceCreditFactor,
      coordinatorAddress,
      mockBaseERC20Token.address,
      duration,
      maxValues,
      treeDepths,
      batchSizes,
      coordinatorMaciPublicKey.asContractParam(),
      extContracts,
      mockRecipientRegistry.address
    );
  });

  it("verify - initializes properly", async () => {
    // Wait for the deploy tx.
    const grantRoundDeployTransaction: ContractTransaction =
      grantRound.deployTransaction;
    const txReceipt = await grantRoundDeployTransaction.wait();

    expect(txReceipt.status).to.not.equal(0);
    expect(txReceipt.contractAddress).to.equal(grantRound.address);
  });

  it("verify - configured properly", async () => {
    // Check state (inherited from Poll.sol too).
    expect(await grantRound.voiceCreditFactor()).to.be.equal(
      (BigInt(10 ** 4) * BigInt(10 ** decimals)) / BigInt(10 ** 9)
    );
    expect(await grantRound.coordinator()).to.be.equal(coordinatorAddress);
    expect(await grantRound.nativeToken()).to.be.equal(
      mockBaseERC20Token.address
    );
    expect(await grantRound.recipientRegistry()).to.be.equal(
      mockRecipientRegistry.address
    );
    expect(await grantRound.isCancelled()).to.be.false;
    expect(await grantRound.isFinalized()).to.be.false;
    expect(await grantRound.tallyHash()).to.be.empty;
    expect(await grantRound.totalSpent()).to.be.equal(BigInt(0));
    expect(await grantRound.totalVotes()).to.be.equal(BigInt(0));
    expect(await grantRound.matchingPoolSize()).to.be.equal(BigInt(0));

    expect((await grantRound.coordinatorPubKey()).x).to.be.equal(
      coordinatorMaciPublicKey.asContractParam().x
    );
    expect((await grantRound.coordinatorPubKey()).y).to.be.equal(
      coordinatorMaciPublicKey.asContractParam().y
    );
    expect(await grantRound.mergedStateRoot()).to.be.equal(BigInt(0));
    expect(await grantRound.coordinatorPubKeyHash()).to.be.equal(
      coordinatorMaciPublicKey.hash()
    );
    expect(await grantRound.stateAqMerged()).to.be.equal(false);
    expect(await grantRound.currentSbCommitment()).to.be.equal(BigInt(0));
    expect((await grantRound.maxValues()).maxMessages).to.be.equal(
      maxValues.maxMessages
    );
    expect((await grantRound.maxValues()).maxVoteOptions).to.be.equal(
      maxValues.maxVoteOptions
    );
    expect((await grantRound.treeDepths()).intStateTreeDepth).to.be.equal(
      treeDepths.intStateTreeDepth
    );
    expect((await grantRound.treeDepths()).messageTreeDepth).to.be.equal(
      treeDepths.messageTreeDepth
    );
    expect((await grantRound.treeDepths()).voteOptionTreeDepth).to.be.equal(
      treeDepths.voteOptionTreeDepth
    );
    expect((await grantRound.treeDepths()).messageTreeSubDepth).to.be.equal(
      treeDepths.messageTreeSubDepth
    );
    expect((await grantRound.batchSizes()).messageBatchSize).to.be.equal(
      batchSizes.messageBatchSize
    );
    expect((await grantRound.batchSizes()).tallyBatchSize).to.be.equal(
      batchSizes.tallyBatchSize
    );
    expect((await grantRound.extContracts()).vkRegistry).to.be.equal(
      extContracts.vkRegistry
    );
    expect((await grantRound.extContracts()).maci).to.be.equal(
      extContracts.maci
    );
    expect((await grantRound.extContracts()).messageAq).to.be.equal(
      extContracts.messageAq
    );
  });

  describe("publishMessageBatch()", async () => {
    beforeEach(async () => {
      // Message generation.
      const command = new Command(
        BigInt(1),
        voterMaciKeypair.pubKey,
        BigInt(0),
        BigInt(9),
        BigInt(1),
        BigInt(0),
        BigInt(0)
      );
      const signature = command.sign(voterMaciKeypair.privKey);
      const sharedKey = Keypair.genEcdhSharedKey(
        voterMaciKeypair.privKey,
        coordinatorMaciPublicKey
      );
      const encMessage = command.encrypt(signature, sharedKey);
      message = <MessageStruct>encMessage.asContractParam();

      // Hash message and public key (necessary for mock).
      // nb. can be calculated for one message because the batch is composed of three instances of the same message.
      const n: any[] = [];
      const m: any[] = [];

      n.push(message.data[0]);
      n.push(message.data[1]);
      n.push(message.data[2]);
      n.push(message.data[3]);
      n.push(message.data[4]);

      m.push(message.data[5]);
      m.push(message.data[6]);
      m.push(message.data[7]);
      m.push(message.data[8]);
      m.push(message.data[9]);

      hashMessangeAndEncPubKey = hash4([
        hash5(n),
        hash5(m),
        BigInt(coordinatorMaciPublicKey.asContractParam().x),
        BigInt(coordinatorMaciPublicKey.asContractParam().y),
      ]);
    });

    it("allow a signed user to publish a batch of messages (vote)", async () => {
      // Mocks.
      // nb. in this case the return from enqueue() it is not useful.
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessageBatch(
            [message, message, message],
            [
              coordinatorMaciPublicKey.asContractParam(),
              coordinatorMaciPublicKey.asContractParam(),
              coordinatorMaciPublicKey.asContractParam(),
            ]
          )
      )
        .to.emit(grantRound, "PublishMessage")
        .to.emit(grantRound, "PublishMessage")
        .to.emit(grantRound, "PublishMessage")
        .to.emit(grantRound, "Voted")
        .withArgs(voterAddress);
    });

    it("revert - voting period passed", async () => {
      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      const expectedTime = deployTD[1].add(deployTD[0]).toNumber();
      expect((await ethers.provider.getBlock("latest")).timestamp).to.be.lt(
        expectedTime
      );

      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      expect((await ethers.provider.getBlock("latest")).timestamp).to.be.gt(
        expectedTime
      );

      await expect(
        grantRound
          .connect(voter)
          .publishMessageBatch(
            [message],
            [coordinatorMaciPublicKey.asContractParam()]
          )
      ).to.be.revertedWith("PollE03");
    });

    it("revert - max number of messages reached", async () => {
      // Mocks.
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      for (let i = 0; i <= maxValues.maxMessages; i++) {
        await grantRound
          .connect(voter)
          .publishMessageBatch(
            [message],
            [coordinatorMaciPublicKey.asContractParam()]
          );
      }

      // Should revert the message number maxMessage + 1.
      await expect(
        grantRound
          .connect(voter)
          .publishMessageBatch(
            [message],
            [coordinatorMaciPublicKey.asContractParam()]
          )
      ).to.be.revertedWith("PollE06");
    });

    it("revert - invalid MACI public key", async () => {
      const badContributorMaciPubKey = {
        x: "21888242871839275222246405745257275088548364400416034343698204186575808495617",
        y: "0", // < SNARK_SCALAR_FIELD
      };

      await expect(
        grantRound
          .connect(voter)
          .publishMessageBatch([message], [badContributorMaciPubKey])
      ).to.be.revertedWith("PollE05");
    });
  });

  describe("publishTallyHash()", async () => {
    // Input parameters.
    const dummyTallyHash = "0xabcd";

    it("allow the coordinator to publish the IPFS tally hash", async () => {
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      expect(await grantRound.tallyHash()).to.be.equal(dummyTallyHash);
    });

    it("revert - sender is not the grant round coordinator", async () => {
      await expect(
        grantRound.connect(deployer).publishTallyHash(dummyTallyHash)
      ).to.be.revertedWith("GrantRound: Sender is not the coordinator");
    });

    //TODO: To be checked after grant round finalization.
    it("verify - grant round finalized", async () => {
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      ).to.emit(grantRound, "TallyPublished");
    });

    it("revert - provided tally hash is an empty string", async () => {
      await expect(
        grantRound.connect(coordinator).publishTallyHash("")
      ).to.be.revertedWith("GrantRound: Tally hash is empty string");
    });
  });

  describe("finalize()", async () => {
    //TODO: should fail with must be called by MACI
    it.skip("allow owner to finalize the grant round", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );
    });

    it("revert - sender is not the owner", async () => {
      await expect(
        grantRound
          .connect(coordinator)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith("GrantRound: caller is not MACI.");
    });

    //TODO: move to QFI test
    it("revert - cannot finalize after voting deadline", async () => {
      await expect(
        grantRound
          .connect(deployer)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith("GrantRound: caller is not MACI.");
    });
    //TODO: fix broken test and merge maci verifier bugfix
    it.skip("revert - grant round already finalized", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      // Should revert.
      await expect(
        grantRound
          .connect(deployer)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith("GrantRound: Already finalized");
    });

    //TODO: move to QFI test
    it.skip("revert - stateAq not merged", async () => {
      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        grantRound
          .connect(deployer)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith("GrantRound: State AQ not merged");
    });

    //TODO: move to QFI test
    it.skip("revert - tally hash not published", async () => {
      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      await expect(
        grantRound
          .connect(deployer)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith("GrantRound: Tally hash has not been published");
    });

    //TODO: move to QFI test
    it.skip("revert - no votes", async () => {
      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      await expect(
        grantRound
          .connect(deployer)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith("GrantRound: No votes");
    });

    it.skip("revert - incorrect total amount of spent voice credits", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await expect(
        grantRound
          .connect(deployer)
          .finalize(tallyResults.totalSpent)
      ).to.be.revertedWith(
        "GrantRound: Incorrect total amount of spent voice credits"
      );
    });
  });

  describe("cancel()", async () => {
    it("allow owner to cancel the grant round", async () => {
      await expect(grantRound.connect(deployer).cancel())
        .to.emit(grantRound, "GrantRoundCancelled")
        .withArgs(true, true);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.isCancelled()).to.be.true;
    });

    it("revert - sender is not owner", async () => {
      await expect(grantRound.connect(coordinator).cancel()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("revert - grant round already finalized", async () => {
      await expect(grantRound.connect(deployer).cancel())
        .to.emit(grantRound, "GrantRoundCancelled")
        .withArgs(true, true);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.isCancelled()).to.be.true;

      // Should revert.
      await expect(grantRound.connect(deployer).cancel()).to.be.revertedWith(
        "GrantRound: Already finalized"
      );
    });

    it("revert - cannot cancel grant round twice", async () => {
      await expect(grantRound.connect(deployer).cancel())
        .to.emit(grantRound, "GrantRoundCancelled")
        .withArgs(true, true);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.isCancelled()).to.be.true;

      await expect(grantRound.connect(deployer).cancel()).to.be.revertedWith(
        "GrantRound: Already finalized"
      );
    });
  });

  describe("getAllocatedAmount()", async () => {
    const dummyTallyResult = 1;
    const dummyTotalVotes = 1;
    const dummySpentVoiceCredits = 1;

    // TODO: seems that the state variable totalVotes is never changed, so causing a zero div.
    // (maybe open a new issue?)
    it.skip("allow anyone to retrieve the allocated token amount (without verification)", async () => {
      // Need to finalize to avoid matchingPoolSize equal 0 (invalid opcode).
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      const deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      expect(
        Number(
          await grantRound.getAllocatedAmount(
            dummyTallyResult,
            dummySpentVoiceCredits
          )
        )
      ).to.be.equal(
        (Number(await grantRound.matchingPoolSize()) * dummyTallyResult) /
          dummyTotalVotes +
          dummySpentVoiceCredits * Number(voiceCreditFactor)
      );
    });
  });

  describe("claimFunds()", async () => {
    // Input parameters.
    const voteOptionIndex = 1;
    const dummyTallyResult = 1;
    const dummyTallyResultProof: [
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[]
    ] = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const dummySpentVoiceCreditsHash: BigNumberish = 1;
    const dummyPerVOSpentVoiceCreditsHash: BigNumberish = 1;
    const dummyTallyCommitment: BigNumberish = 1;
    const dummySpent: BigNumberish = 1;
    const dummySpentProof: [
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[]
    ] = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const dummySpentSalt: BigNumberish = 1;
    const dummyTallyResultSalt: BigNumberish = 1;

    // TODO: seems that verifyTallyResult() and verifyPerVOSpentVoiceCredits() seems to always return false.
    // (maybe open a new issue?)
    it.skip("allow a recipient to claim the funds", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      let deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      // Mocks.
      deployTD = await grantRound.getDeployTimeAndDuration();
      await mockRecipientRegistry.mock.getRecipientAddress
        .withArgs(
          voteOptionIndex,
          deployTD[0],
          Number(deployTD[0]) + Number(deployTD[1])
        )
        .returns(recipientAddress);
      const allocatedAmount = await grantRound
        .connect(recipient)
        .getAllocatedAmount(dummyTallyResult, dummySpent);
      await mockBaseERC20Token.mock.transfer
        .withArgs(recipientAddress, allocatedAmount)
        .returns(true);

      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent,
        
          )
      )
        .to.emit(grantRound, "FundsClaimed")
        .withArgs(recipientAddress, voteOptionIndex, allocatedAmount);
    });
    //TODO: fix broken test and merge maci verifier bugfix
    it.skip("allow to send funds back to the matching pool if recipient address is zero", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      let deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      // Mocks.
      deployTD = await grantRound.getDeployTimeAndDuration();
      await mockRecipientRegistry.mock.getRecipientAddress
        .withArgs(
          voteOptionIndex,
          deployTD[0],
          Number(deployTD[0]) + Number(deployTD[1])
        )
        .returns(constants.AddressZero);
      const allocatedAmount = await grantRound
        .connect(recipient)
        .getAllocatedAmount(dummyTallyResult, dummySpent);
      const newRecipient = await grantRound.owner();
      await mockBaseERC20Token.mock.transfer
        .withArgs(newRecipient, allocatedAmount)
        .returns(true);

      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent
          )
      )
        .to.emit(grantRound, "FundsClaimed")
        .withArgs(newRecipient, voteOptionIndex, allocatedAmount);
    });

    it("revert - grant round not finalized", async () => {
      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent
          )
      ).to.be.revertedWith("GrantRound: Round not finalized");
    });

    it("revert - grant round cancelled", async () => {
      await expect(grantRound.connect(deployer).cancel())
        .to.emit(grantRound, "GrantRoundCancelled")
        .withArgs(true, true);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.isCancelled()).to.be.true;

      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent
          )
      ).to.be.revertedWith("GrantRound: Round has been cancelled");
    });

    // TODO: Same as todo above.
    it.skip("revert - funds already claimed", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      let deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      // Mocks.
      deployTD = await grantRound.getDeployTimeAndDuration();
      await mockRecipientRegistry.mock.getRecipientAddress
        .withArgs(
          voteOptionIndex,
          deployTD[0],
          Number(deployTD[0]) + Number(deployTD[1])
        )
        .returns(recipientAddress);
      const allocatedAmount = await grantRound
        .connect(recipient)
        .getAllocatedAmount(dummyTallyResult, dummySpent);
      await mockBaseERC20Token.mock.transfer
        .withArgs(recipientAddress, allocatedAmount)
        .returns(true);

      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent
          )
      )
        .to.emit(grantRound, "FundsClaimed")
        .withArgs(recipientAddress, voteOptionIndex, allocatedAmount);

      // Should revert.
      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent
          )
      ).to.be.revertedWith("FundingRound: Funds already claimed");
    });
    //TODO: fix broken test and merge maci verifier bugfix
    it.skip("revert - incorrect tally result for the grant round", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      let deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      // Mocks.
      deployTD = await grantRound.getDeployTimeAndDuration();
      await mockRecipientRegistry.mock.getRecipientAddress
        .withArgs(
          voteOptionIndex,
          deployTD[0],
          Number(deployTD[0]) + Number(deployTD[1])
        )
        .returns(recipientAddress);
      const allocatedAmount = await grantRound
        .connect(recipient)
        .getAllocatedAmount(dummyTallyResult, dummySpent);
      await mockBaseERC20Token.mock.transfer
        .withArgs(recipientAddress, allocatedAmount)
        .returns(true);

      // Should revert.
      await expect(
        grantRound
          .connect(recipient)
          .claimFunds(
            voteOptionIndex,
            dummyTallyResult,
            dummyTallyResultProof,
            dummyTallyResultSalt,
            dummySpentVoiceCreditsHash,
            dummyPerVOSpentVoiceCreditsHash,
            dummyTallyCommitment,
            dummySpent
          )
      ).to.be.revertedWith("FundingRound: Incorrect tally result");
    });

    // TODO: we need to verifyTallyResult() return true and then test for verifyPerVOSpentVoiceCredits() false.
    it.skip("revert - incorrect amount of spent voice credits", async () => {
      await mockMessageAq.mock.enqueue
        .withArgs(hashMessangeAndEncPubKey)
        .returns(0);

      await expect(
        grantRound
          .connect(voter)
          .publishMessage(message, coordinatorMaciPublicKey.asContractParam())
      ).to.emit(grantRound, "PublishMessage");

      // Directly manage for expiring the voting period.
      let deployTD = await grantRound.getDeployTimeAndDuration();
      await ethers.provider.send("evm_increaseTime", [Number(deployTD[1]) + 1]);
      await ethers.provider.send("evm_mine", []);

      // Mocks for trees merge.
      await mockMessageAq.mock.mergeSubRoots.withArgs(0).returns();
      await mockMessageAq.mock.merge
        .withArgs(treeDepths.messageTreeDepth)
        .returns(0);
      await mockQfi.mock.stateAq.withArgs().returns(mockMaciStateAq.address);
      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(false);
      await mockQfi.mock.mergeStateAqSubRoots.withArgs(0, 0).returns();

      await grantRound.mergeMessageAqSubRoots(0);
      await grantRound.mergeMessageAq();
      await grantRound.mergeMaciStateAqSubRoots(0, 0);

      await mockMaciStateAq.mock.subTreesMerged.withArgs().returns(true);
      await mockQfi.mock.mergeStateAq.withArgs(0).returns(1);
      await mockQfi.mock.getStateAqRoot.withArgs().returns(1);

      await grantRound.mergeMaciStateAq(0);

      // Publish tally hash.
      const dummyTallyHash = "0xabcd";
      await expect(
        grantRound.connect(coordinator).publishTallyHash(dummyTallyHash)
      )
        .to.emit(grantRound, "TallyPublished")
        .withArgs(dummyTallyHash);

      // Mocks.
      const dummyBalance = 100;
      await mockBaseERC20Token.mock.balanceOf
        .withArgs(grantRound.address)
        .returns(dummyBalance);

      await grantRound
        .connect(deployer)
        .finalize(tallyResults.totalSpent);

      expect(await grantRound.isFinalized()).to.be.true;
      expect(await grantRound.totalSpent()).to.be.equal(
        tallyResults.totalSpent
      );
      expect(await grantRound.matchingPoolSize()).to.be.equal(
        BigInt(dummyBalance) -
          BigInt(tallyResults.totalSpent) * voiceCreditFactor
      );

      // Mocks.
      deployTD = await grantRound.getDeployTimeAndDuration();
      await mockRecipientRegistry.mock.getRecipientAddress
        .withArgs(
          voteOptionIndex,
          deployTD[0],
          Number(deployTD[0]) + Number(deployTD[1])
        )
        .returns(recipientAddress);
      const allocatedAmount = await grantRound
        .connect(recipient)
        .getAllocatedAmount(dummyTallyResult, dummySpent);
      await mockBaseERC20Token.mock.transfer
        .withArgs(recipientAddress, allocatedAmount)
        .returns(true);

      // Should revert.
      // await expect(
      //   grantRound
      //     .connect(recipient)
      //     .claimFunds(
      //       voteOptionIndex,
      //       dummyTallyResult,
      //       dummyTallyResultProof,
      //       dummyTallyResultSalt,
      //       dummySpentVoiceCreditsHash,
      //       dummyPerVOSpentVoiceCreditsHash,
      //       dummyTallyCommitment,
      //       dummySpent,
      //       dummySpentProof,
      //       dummySpentSalt
      //     )
      // ).to.be.revertedWith(
      //   "GrantRound: Incorrect total amount of spent voice credits"
      // );
    });
  });
});
