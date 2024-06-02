import {AfterViewInit, Component, OnInit} from '@angular/core';
import {TestsService} from "../shared/services/tests.service";
import {Router, RouterLink} from "@angular/router";
import {Test} from "../shared/interfaces";
import {NgForOf, NgIf} from "@angular/common";
import {DesignService} from "../shared/classes/design";

@Component({
  selector: 'app-tests-page',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    NgIf
  ],
  templateUrl: './tests-page.component.html',
  styleUrl: './tests-page.component.css'
})
export class TestsPageComponent implements OnInit, AfterViewInit{

  loading = true
  popularTests: Test[] = [];
  latestTests: Test[] = [];
  tests: Test[]

  constructor(private testsService: TestsService, private router: Router) {
  }

  ngOnInit() {
    this.testsService.fetch().subscribe({
      next: tests => {

        this.tests = tests

        // Сортировка тестов по количеству прохождений (popularTests)
        this.popularTests = tests.slice().sort((a, b) => {
          const usersResultsA = a.usersResults ? a.usersResults.length : 0;
          const usersResultsB = b.usersResults ? b.usersResults.length : 0;
          return usersResultsB - usersResultsA;
        }).slice(0, 8);;


        // Сортировка тестов по дате выхода (latestTests)
        this.latestTests = tests.slice().sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 4);;
      },
      error: error => {
        console.log(error);
      },
      complete: () => {
        this.loading = false

      }
    });
  }

  ngAfterViewInit() {
    DesignService.scrollReveal()
  }
}
