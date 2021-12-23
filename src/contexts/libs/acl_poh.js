// access control mock up for a contract. POH (https://app.proofofhumanity.id/)
// it relies on an onchain verification of register in their contract (0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb).
// in order to verify the account used (this could be called with a hardcoded account)
// we need to sign a basic msg and in here verify the signature, then use the account
// to verify in whatever contract (DAO, POH, etc)
import { abi } from './pohAbi.js';
const AccessController = require('orbit-db-access-controllers/src/access-controller-interface')
// const Personal = require('web3-eth-personal');
const Web3 = require('web3');

// const isValidEthAddress = require('./utils/is-valid-eth-address')
const io = require('orbit-db-io')
const web3Provider = new Web3(window.ethereum);
const pohAddress = '0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb'
// const personal = new Personal(Personal.givenProvider || 'ws://some.local-or-remote.node:8546');
const web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');

export default class POHController extends AccessController {
    constructor (ipfs, web3Provider, defaultAccount) {
      super()
      this._ipfs = ipfs
      this.web3 = web3Provider
      this.abi = abi
      this.contractAddress = pohAddress
      this.defaultAccount = defaultAccount
    }
    static get type () { return 'ProofOfHumanity' } // Return the type for this controller

    get address () {
      // console.log('address ',this.contractAddress)
      return this.contractAddress
    }

    async load (address) {
      this.contract = new web3Provider.eth.Contract(this.abi, pohAddress)
      // console.log('loading', this)
      // https://github.com/orbitdb/orbit-db-access-controllers/blob/main/src/contract-access-controller.js
    }

    async canAppend(entry, signature) {
      // remember that this call is made to mainnet so you need to be connected on it.
      if(!entry.payload.key){
        console.log('Error, no account in entry')
        return false
      }
      // entry.payload.key will be a signed message
      // console.log('key',entry.payload.key)
      // We need to check that signature and then if its registered
      let recoveredAddress = await web3.eth.personal.ecRecover("Account verification", entry.payload.key)
      // console.log('recoveredAddress',recoveredAddress)
      const accountChecked = recoveredAddress; // could be checked as a correct address
      const isRegistered = await this.contract.methods.isRegistered(accountChecked).call()
      if(isRegistered){
        // console.log('isRegistered',isRegistered);
        return true;
      }else{
        console.log('Register as a human to interact with this DB');
        return false;
      }
    }

    async grant (access, identity) {} // Logic for granting access to identity

    async save () {
      let cid;
      try {
        cid = await io.write(this._ipfs, 'dag-cbor', {
          contractAddress: this.address,
          abi: JSON.stringify(this.abi, null, 2)
        })
        console.log('saved',cid)
      } catch (e) {
        console.log('ContractAccessController.save ERROR:', e)
      }
      // return the manifest data
      return { address: cid }
    }

    static async create (orbitdb, options) {
      //check for needed data before create
      // if (!options.defaultAccount) {
      //   console.warn('WARNING: no defaultAccount set')
      // }

      return new POHController(
        orbitdb._ipfs,
        options.web3,
        options.contractAddress,
        options.defaultAccount
      )
    }
}

// check signature in entry
// validate address in contract
// perform entry

// access control:
//P2P
//---
// That should be a signature that will be handled (and verifyied by the access control)
// access control should look at the contract members and only allow those to make entries!

// Contract based
// ---
