import {Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
import {DesignService} from "../shared/classes/design";
import {FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, AbstractControl} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {AuthService} from "../shared/services/auth.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Params, Router, RouterLink} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent implements AfterViewInit, OnInit, OnDestroy {

  signInForm: FormGroup
  signUpForm: FormGroup;
  subDef: Subscription

  @ViewChild('innerbox', {static: true}) innerBoxRef!: ElementRef;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute,
              private toastr: ToastrService, private authService: SocialAuthService,) {
  }

  ngOnInit() {
    this.signInForm = new FormGroup({
      signInEmail: new FormControl(null, [Validators.required, Validators.email]),
      signInPassword: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })

    this.signUpForm = new FormGroup({
      signUpName: new FormControl('', Validators.required),
      signUpEmail: new FormControl('', [Validators.required, Validators.email]),
      signUpPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      signUpPasswordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)])
    }, { validators: this.passwordMatchValidator });

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        // authorization successfully
      } else if (params['accessDenied']) {
        // you need to authorize firstly
      } else if (params['sessionFailed']) {
        // need new login
      }
    })

    this.authService.authState.subscribe(async (user) => {
      this.subDef = this.auth.googleAuth(user.email, user.name).subscribe({
        next: () => {
          this.toastr.success('Авторизація успішна!')
          this.router.navigate(['/main'])
        },
        error: (errorResponse: any) => {
          this.toastr.error(errorResponse.error.message, 'Помилка')
          this.signInForm.enable()
        },
        complete: () => {
          this.authService.signOut();
        }
      })
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('signUpPassword');
    const confirmPassword = control.get('signUpPasswordConfirm');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
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
    this.signUpForm.disable();
    this.subDef = this.auth.register(this.signUpForm.value).subscribe({
      next: () => {
        this.toastr.success('Аккаунт створено, успішно.');
        this.router.navigate(['/main'], {
          queryParams: {
            registered: true
          }
        });
      },
      error: (errorResponse: any) => {
        this.toastr.error(errorResponse.error.message, 'Помилка');
        this.signUpForm.enable();
      }
    });
  }

  ngOnDestroy() {
    if (this.subDef) {
      this.subDef.unsubscribe()
    }
  }
}
