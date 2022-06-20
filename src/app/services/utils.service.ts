import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  getRarity(rarity: string) {
    switch (Number(rarity)) {
      case 4:
        return 'Legendary';
      case 3:
        return 'Epic';
      case 2:
        return 'Rare';
      case 1:
        return 'Uncommon';
      case 0:
        return 'Common';
      default:
        return 'Common';
    }
  }

  getGender(gender: string) {
    return Number(gender) === 0 ? 'Female' : 'Male';
  }

  avatarFromContract(data: any, attributes: any, status: any) {
    return {
      avatarId: data.avatarId,
      rarity: this.getRarity(data.rarity),
      gender: this.getGender(data.gender),
      level: Number(data.level),
      exp: Number(data.exp),
      attributes: attributes.map(
        (attribute: any, i: number) =>
          `${this.attributeToName(i)}: ${Number(attribute)}`
      ).join(' | '),
      genes: data.genes.join(', '),
      status: Number(status),
      hp: 0,
    };
  }

  attributeToName(attribute: number) {
    switch (attribute) {
      case 0:
        return 'CHA';
      case 1:
        return 'CON';
      case 2:
        return 'DEX';
      case 3:
        return 'INT';
      case 4:
        return 'PER';
      case 5:
        return 'STR';
      default:
        return '??';
    }
  }
}
