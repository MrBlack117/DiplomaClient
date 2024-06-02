import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {ToastrService} from "ngx-toastr";
import {User} from "../shared/interfaces";

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgForOf
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit{

  isAdmin:boolean = true
  form: FormGroup;
  roleForm: FormGroup;
  roles: string[] = ['пользователь', 'психолог', 'администратор'];
  userInfo: any;



  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.roleForm = this.formBuilder.group({
      _id: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  getUserInfo() {
    if (this.form.invalid) {
      return;
    }

    const email = this.form.get('email')?.value;

    this.authService.getUserByEmail(email).subscribe({
      next: data => {
        this.userInfo = data;

        if(data == null){
          this.toastr.error('Користувача не знайдено')
        }else{
          this.roleForm.patchValue({_id: data._id});
        }
      },
      error: error => {
        console.error('Error fetching user info:', error);
      }
    });
  }

  onSubmit() {
    if (this.roleForm.valid) {

      const updated: User = this.roleForm.value;

      this.authService.updateUser(updated).subscribe({
        next: data => {
          this.userInfo = data;
          this.toastr.success('Оновлення успішне') // Обновления нет на сервере, проверь контроллери
        },
        error: err => {
          this.toastr.error(err);
        }
      })
    }
  }

}
