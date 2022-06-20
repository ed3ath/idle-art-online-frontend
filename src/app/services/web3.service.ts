import { Injectable } from '@angular/core';
import Web3 from 'web3';
declare let window:any;

import { EventsService } from './event.service';

import CorToken from '../../../../build/contracts/CorToken.json';
import BasicPriceOracle from '../../../../build/contracts/BasicPriceOracle.json';
import Avatars from '../../../../build/contracts/Avatars.json';
import Skills from '../../../../build/contracts/Skills.json';
import Events from '../../../../build/contracts/Events.json';
import Cardinal from '../../../../build/contracts/Cardinal.json';

import address from '../../../../address.json';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  web3: any;
  defaultAccount: any;
  contracts: any;

  constructor(private eventsService: EventsService) {}

  async init() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      await window.ethereum.enable;
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You Should consider using MetaMask!'
      );
    }

    this.contracts = {
      token: new this.web3.eth.Contract(CorToken.abi, address.CorToken),
      oracle: new this.web3.eth.Contract(
        BasicPriceOracle.abi,
        address.BasicPriceOracle
      ),
      avatars: new this.web3.eth.Contract(Avatars.abi, address.Avatars),
      skills: new this.web3.eth.Contract(Skills.abi, address.Skills),
      events: new this.web3.eth.Contract(Events.abi, address.Events),
      cardinal: new this.web3.eth.Contract(Cardinal.abi, address.Cardinal),
    };
  }

  getContract(contract: string) {
    return this.contracts[contract];
  }

  setDefaultAccount(account: string) {
    this.defaultAccount = account;
  }

  async signIn() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.defaultAccount = accounts[0];
    this.eventsService.publish('userStatusChanged', accounts[0]);
  }

  async signOut() {
    this.defaultAccount = '';
    this.eventsService.publish('userStatusChanged', false);
  }

  getWeb3() {
    return this.web3;
  }
}
