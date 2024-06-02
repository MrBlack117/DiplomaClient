import {Component} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {tableData} from "./luscherData";
import {LuscherResult} from "../shared/interfaces";

@Component({
  selector: 'app-luscher-page',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './luscher-page.component.html',
  styleUrl: './luscher-page.component.css'
})
export class LuscherPageComponent {
  colors = [
    {id: 0, color: 'grey'},
    {id: 1, color: 'blue'},
    {id: 2, color: 'green'},
    {id: 3, color: 'red'},
    {id: 4, color: 'yellow'},
    {id: 5, color: 'violet'},
    {id: 6, color: 'brown'},
    {id: 7, color: 'black'},
  ];
  colorCards: { id: number, color: string }[] = []

  firstSelection: number[] = [];
  secondSelection: number[] = [];
  currentSelection = 0;
  userResult: LuscherResult[] = []

  nextSection() {
    this.currentSelection += 1;
    this.colorCards = this.colors;
  }

  selectColor(id: number) {
    if (this.currentSelection === 1) {
      this.firstSelection.push(id);
      if (this.firstSelection.length === this.colors.length) {
        this.currentSelection = 2;
      }
    } else {
      this.secondSelection.push(id);
      if (this.secondSelection.length === this.colors.length) {
        this.currentSelection = 4;
        this.processResults()
      }
    }
    this.colorCards = this.colorCards.filter(color => color.id !== id);
  }

  processResults() {
    const firstKeys = this.groupColors(this.firstSelection)
    const secondKeys = this.groupColors(this.secondSelection)
    for (let i = 0; i < 5; i++) {
      this.userResult.push({
        firstSelection: tableData[firstKeys[i]],
        secondSelection: firstKeys[i] === secondKeys[i] ? 'Співпадає з першою' : tableData[secondKeys[i]]
      })
    }
  }

  groupColors(result: number[]) {
    const keys: string[] = []
    keys.push(`+${result[0]}+${result[1]}`);
    keys.push(`x${result[2]}x${result[3]}`);
    keys.push(`=${result[4]}=${result[5]}`);
    keys.push(`-${result[6]}-${result[7]}`);
    keys.push(`+${result[0]}-${result[7]}`);

    return keys;
  }

}
