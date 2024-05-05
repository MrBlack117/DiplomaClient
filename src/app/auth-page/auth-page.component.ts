import {Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
import {DesignService} from "../shared/classes/design";
import {FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {AuthService} from "../shared/services/auth.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Params, Router, RouterLink} from "@angular/router";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent implements AfterViewInit, OnInit, OnDestroy {

  signInForm: FormGroup
  signUpForm: FormGroup;
  subDef: Subscription

  @ViewChild('innerbox', {static: true}) innerBoxRef!: ElementRef;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.signInForm = new FormGroup({
      signInEmail: new FormControl(null, [Validators.required, Validators.email]),
      signInPassword: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })

    this.signUpForm = new FormGroup({
      signUpName: new FormControl(null, [Validators.required]),
      signUpEmail: new FormControl(null, [Validators.required, Validators.email]),
      signUpPassword: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        // authorization successfully
      } else if (params['accessDenied']) {
        // you need to authorize firstly
      } else if (params['sessionFailed']) {
        // need new login
      }
    })
  }

  ngAfterViewInit() {
    DesignService.authToggle(this.innerBoxRef);
  }


  signInSubmit() {
    this.signInForm.disable()
    this.subDef = this.auth.login(this.signInForm.value).subscribe({
        next: () => {
          this.toastr.success('Авторизація успішна!')
          this.router.navigate(['/main'])
        },
        error: (errorResponse: any) => {
          this.toastr.error(errorResponse.error.message, 'Помилка')
          this.signInForm.enable()
        }
      })
  }

  signUpSubmit() {
    this.signUpForm.disable()
    this.subDef = this.auth.register(this.signUpForm.value).subscribe({
      next: () => {
        this.toastr.success('Аккаунт створено, будь ласка авторизуйтесь.')
        this.router.navigate(['/auth'], {
          queryParams: {
            registered: true
          }
        })
      },
      error: (errorResponse: any) => {
        this.toastr.error(errorResponse.error.message, 'Помилка')
        this.signUpForm.enable()
      }
    })
  }

  ngOnDestroy() {
    if (this.subDef) {
      this.subDef.unsubscribe()
    }
  }
}
