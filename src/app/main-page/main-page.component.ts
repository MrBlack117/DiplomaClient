import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DesignService} from "../shared/classes/design";
import {RouterLink} from "@angular/router";
import {TestsService} from "../shared/services/tests.service";
import {Test} from "../shared/interfaces";
import {NgForOf} from "@angular/common";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements AfterViewInit, OnInit {

  @ViewChild('accordionItems', {static: true}) accordionItemsRef!: ElementRef;

  popularTests: Test[] = []
  apiUrl = environment.apiUrl + '/';

  constructor(private testsService: TestsService) {
  }

  ngOnInit() {
    this.testsService.fetch().subscribe({
      next: tests => {
        this.popularTests = tests.slice().sort((a, b) => {
          const usersResultsA = a.usersResults ? a.usersResults.length : 0;
          const usersResultsB = b.usersResults ? b.usersResults.length : 0;
          return usersResultsB - usersResultsA;
        }).slice(0, 8);

      },
      error: error => {
        console.log(error);
      },
      complete: () => {

      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      DesignService.swiper()
      DesignService.scrollReveal()
      DesignService.accordionSetup(this.accordionItemsRef)
    })

  }
}
