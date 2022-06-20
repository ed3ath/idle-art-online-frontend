import { Component, OnInit } from '@angular/core';
import web3Utils from 'web3-utils';
import { MatDialog } from '@angular/material/dialog';

import { Web3Service } from 'src/app/services/web3.service';
import { UtilsService } from 'src/app/services/utils.service';
import { EventsService } from 'src/app/services/event.service';
import { MatTableDataSource } from '@angular/material/table';

import { AdventureModal } from './modals/adventure.modal';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  displayedColumns: string[] = [
    'avatarId',
    'rarity',
    'gender',
    'level',
    'exp',
    'attributes',
    'hp',
    'genes',
    'actions',
  ];
  defaultAccount: string = '';
  avatars: any;
  avatarIds: any;
  web3: any;
  contracts: any;
  defaults: any;

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    public utilsService: UtilsService,
    private eventsService: EventsService
  ) {
    this.avatars = new MatTableDataSource([]);
    this.eventsService.subscribe('userStatusChanged', async (account) => {
      if (!account) {
        this.avatars = new MatTableDataSource([]);
        this.defaults = {};
        this.defaultAccount = '';
      } else {
        this.defaultAccount = account;
        this.defaults = { from: this.defaultAccount };
        await this.ticker();
      }
    });
    this.eventsService.subscribe('avatarRefresh', async () => {
      await this.ticker();
    });
  }

  async ngOnInit() {
    this.avatars = new MatTableDataSource([]);
    await this.web3Service.signIn();
    await this.ticker();
  }

  async ticker() {
    this.defaultAccount = this.web3Service.defaultAccount;
    this.defaults = { from: this.defaultAccount };
    this.web3 = this.web3Service.getWeb3();
    this.avatarIds = await this.getAvatarIds();
    const avatars = await this.fetchAvatarDetails();
    this.avatars = new MatTableDataSource(avatars);
  }

  async getAvatarIds() {
    const contract = this.web3Service.getContract('avatars');
    const avatarIds = await contract.methods
      .getAvatars(this.defaultAccount)
      .call(this.defaults);
    return avatarIds;
  }

  async fetchAvatarDetails() {
    const contract = this.web3Service.getContract('avatars');
    let i = 0;
    const avatars = [];
    for await (let avatarId of this.avatarIds) {
      avatars[i] = this.utilsService.avatarFromContract(
        await contract.methods.getAvatar(avatarId).call(this.defaults),
        await contract.methods.getAttributes(avatarId).call(this.defaults),
        await contract.methods.getNftVar(avatarId, 2).call(this.defaults)
      );
      avatars[i].hp = await this.getHitPoints(avatarId);
      i++;
    }
    return avatars;
  }

  async mintFreeAvatar() {
    const contract = this.web3Service.getContract('cardinal');
    await contract.methods.mintFreeAvatar().send({
      from: this.defaultAccount,
      gasPrice: web3Utils.toWei('20', 'gwei'),
    });
    await this.ticker();
  }

  async mintAvatar() {
    const cardinal = this.web3Service.getContract('cardinal');
    const token = this.web3Service.getContract('token');
    const mintFee = await cardinal.methods.mintAvatarFee().call(this.defaults);
    const corFee = await cardinal.methods
      .usdToCor(mintFee.toString())
      .call(this.defaults);

    await token.methods
      .approve(cardinal._address, web3Utils.toWei(corFee.toString(), 'ether'))
      .send({
        from: this.defaultAccount,
        gasPrice: web3Utils.toWei('20', 'gwei'),
      });
    await cardinal.methods.mintAvatar().send({
      from: this.defaultAccount,
      gasPrice: web3Utils.toWei('20', 'gwei'),
    });
    await this.ticker();
  }

  async doAdventure(avatarId: string) {
    this.dialog.open(AdventureModal, {
      data: { avatarId, defaults: this.defaults },
    });
  }

  async getHitPoints(avatarId: string) {
    const avatars = this.web3Service.getContract('avatars');
    return await avatars.methods.getHitPoints(avatarId).call(this.defaults);
  }

  async getEvents(avatarId: string) {
    const cardinal = this.web3Service.getContract('cardinal');
    const events = this.web3Service.getContract('events');
    const advId = await cardinal.methods
      .getAvatarAdvId(avatarId)
      .call(this.defaults);
    const eventIds = await cardinal.methods
      .getAdventureEvents(advId)
      .call(this.defaults);

    const advEvents = [];
    let i = 0;
    for await (let eventId of eventIds) {
      advEvents[i] = await events.methods.getEvent(eventId).call(this.defaults);
      i++;
    }
    console.log(advEvents);
  }

  async endAdventure(avatarId: string) {
    const contract = this.web3Service.getContract('cardinal');
    await contract.methods.endAdventure(avatarId).send(this.defaults);
    await this.ticker();
  }
}
