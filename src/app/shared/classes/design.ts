import Swiper from "swiper";
import ScrollReveal from 'scrollreveal';
import {Renderer2, ElementRef, HostListener} from '@angular/core';


export class DesignService {
  static swiper() {
    const swiperPopular = new Swiper(".popular__container", {
      spaceBetween: 32,
      grabCursor: true,
      slidesPerView: 'auto',
      loop: true,


      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  }

  static scrollReveal() {
    const sr = ScrollReveal({
      origin: 'top',
      distance: '60px',
      duration: 2500,
      delay: 300,
      // reset: true
    })

    sr.reveal('.home__title, .popular__container, .subscribe__container, .footer__container')
    sr.reveal('.home__description, .footer__info', {delay: 500})
    sr.reveal('.home__button', {delay: 600})
    sr.reveal('.home__psychology', {delay: 700})
    sr.reveal('.home__images', {delay: 800, origin: 'bottom'})
    sr.reveal('.logos__img', {interval: 100})
    sr.reveal('.psychology__images, .contact__content', {origin: 'left'})
    sr.reveal('.psychology__content, .contact__images', {origin: 'right'})
  }

  static onWindowScroll(scrollY: number, headerRef: ElementRef, scrollUpRef: ElementRef) {
    const headerElement = headerRef.nativeElement;
    const scrollUp = scrollUpRef.nativeElement;
    if (scrollY >= 50) {
      headerElement.classList.add('scroll-header');
    } else {
      headerElement.classList.remove('scroll-header');
    }
    if (scrollY >= 350) {
      scrollUp.classList.add('show-scroll');
    } else {
      scrollUp.classList.remove('show-scroll');
    }
  }


  static accordionSetup(accordionItemsRef: ElementRef) {
    const accordionItems = accordionItemsRef.nativeElement.querySelectorAll('.psychology__accordion-item');
    accordionItems.forEach((item: Element) => { // Приводим тип к Element
      const accordionHeader = item.querySelector('.psychology__accordion-header');
      accordionHeader?.addEventListener('click', () => {
        const openItem = accordionItemsRef.nativeElement.querySelector('.accordion-open') as HTMLElement;
        this.toggleItem(item as HTMLElement);
        if (openItem && openItem !== item) {
          this.toggleItem(openItem);
        }
      });
    });
  }

  private static toggleItem(item: HTMLElement) {
    const accordionContent = item.querySelector('.psychology__accordion-content') as HTMLElement;
    if (!accordionContent) return;
    if (item.classList.contains('accordion-open')) {
      accordionContent.removeAttribute('style');
      item.classList.remove('accordion-open');
    } else {
      accordionContent.style.height = accordionContent.scrollHeight + 'px';
      item.classList.add('accordion-open');
    }
  }


  static themeChanger(buttonRef: ElementRef, body: HTMLElement) {

    const themeButton = buttonRef.nativeElement
    const darkTheme = 'dark-theme'
    const iconTheme = 'bx-sun'

// Previously selected topic (if user selected)
    const selectedTheme = localStorage.getItem('selected-theme')
    const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
    const getCurrentTheme = () => body.classList.contains(darkTheme) ? 'dark' : 'light'
    const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'bx bx-moon' : 'bx bx-sun'

// We validate if the user previously chose a topic
    if (selectedTheme) {
      // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
      body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
      themeButton.classList[selectedIcon === 'bx bx-moon' ? 'add' : 'remove'](iconTheme)
    }

// Activate / deactivate the theme manually with the button
    themeButton.addEventListener('click', () => {
      // Add or remove the dark / icon theme
      body.classList.toggle(darkTheme)
      themeButton.classList.toggle(iconTheme)
      // We save the theme and the current icon that the user chose
      localStorage.setItem('selected-theme', getCurrentTheme())
      localStorage.setItem('selected-icon', getCurrentIcon())
    })
  }


  static authToggle(innerBoxRef: ElementRef) {
    const innerBox = innerBoxRef.nativeElement;
    const toggle_btns = innerBox.querySelectorAll(".toggle");
    toggle_btns.forEach((btn: Element) => {
      btn.addEventListener("click", () => {
        innerBox.classList.toggle("sign-up-mode")
      })
    })
  }

  static modalInit(popupRef: ElementRef, overlayRef: ElementRef) {
    const section = popupRef.nativeElement,
      overlay = overlayRef.nativeElement


    overlay.addEventListener("click", () =>
      section.classList.remove("active")
    );


    /*

    showBtn.addEventListener("click", () => section.classList.add("active"));

    closeBtn.addEventListener("click", () =>
      section.classList.remove("active")
    );

    */
  }
}
