import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Web3Service } from 'src/app/services/web3.service';
import { EventsService } from 'src/app/services/event.service';

@Component({
  selector: 'app-game',
  templateUrl: './adventure.modal.html',
})
export class AdventureModal {
  durationType: any;
  durationValue: any;
  constructor(
    public dialogRef: MatDialogRef<AdventureModal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private web3Service: Web3Service,
    private eventsService: EventsService
  ) {}

  async doAdventure() {
    if (!this.durationType || !this.durationValue) return;
    const contract = this.web3Service.getContract('cardinal');
    await contract.methods
      .doAdventure(this.data.avatarId, this.durationType, this.durationValue)
      .send(this.data.defaults);
    this.eventsService.publish('avatarRefresh');
    this.dialogRef.close();
  }
}
