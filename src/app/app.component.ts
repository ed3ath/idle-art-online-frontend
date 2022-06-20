import { Component, OnInit } from '@angular/core';

import { EventsService } from './services/event.service';
import { Web3Service } from './services/web3.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'idle-art-online';
  defaultAccount: string = '';
  constructor(
    public web3Service: Web3Service,
    private eventsService: EventsService
  ) {
    this.eventsService.subscribe('userStatusChanged', (account) => {
      this.defaultAccount = account ? account : '';
    });
  }

  async ngOnInit() {
    await this.web3Service.init();
    this.defaultAccount = await this.web3Service.defaultAccount;
  }
}
