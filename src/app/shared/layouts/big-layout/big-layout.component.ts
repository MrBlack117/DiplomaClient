import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RouterModule} from "@angular/router";
import {DesignService} from "../../classes/design";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-big-layout',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './big-layout.component.html',
  styleUrl: './big-layout.component.css'
})
export class BigLayoutComponent implements AfterViewInit, OnInit {

  @ViewChild('header', { static: true }) headerRef!: ElementRef;
  @ViewChild('scrollUp', {static: true}) scrollUpRef!: ElementRef;
  @ViewChild('themebtn', {static: true}) themeBtnRef!: ElementRef;

  user: { name: string, email: string};

  ngOnInit() {
    const userString = localStorage.getItem('user')
    if (userString !== null) {
      this.user = JSON.parse(userString);
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      DesignService.onWindowScroll(scrollY, this.headerRef, this.scrollUpRef);
    });

    DesignService.themeChanger(this.themeBtnRef, document.body);
  }



  protected readonly HTMLElement = HTMLElement;
}
