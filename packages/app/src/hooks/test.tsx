import { genRandomSalt } from 'qaci-crypto'
import { Keypair, PubKey, Command, Message } from 'qaci-domainobjs'



export function createMessage(
  userStateIndex: number,
  userKeypair: Keypair,
  newUserKeypair: Keypair | null,
  coordinatorPubKey: PubKey,
  voteOptionIndex: number | null,
  voteWeight: number | null,
  nonce: number
): [Message, PubKey] {
  const encKeypair = new Keypair();
  
   const  salt = genRandomSalt();
  
  const quadraticVoteWeight = voteWeight?? 0;
  const pubkey = userKeypair.pubKey;
  const command = new Command(
    BigInt(userStateIndex),
    pubkey,
    BigInt(voteOptionIndex || 0),
    BigInt(quadraticVoteWeight.toString()),
    BigInt(nonce),
    salt
  );
  const signature = command.sign(userKeypair.privKey);
  const message = command.encrypt(signature, Keypair.genEcdhSharedKey(encKeypair.privKey, coordinatorPubKey));
  return [message, encKeypair.pubKey];
}