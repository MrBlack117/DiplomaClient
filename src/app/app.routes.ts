import { Routes } from '@angular/router';
import {BigLayoutComponent} from "./shared/layouts/big-layout/big-layout.component";
import {SmallLayoutComponent} from "./shared/layouts/small-layout/small-layout.component";
import {MainPageComponent} from "./main-page/main-page.component";
import {TestsPageComponent} from "./tests-page/tests-page.component";
import {TestPageComponent} from "./test-page/test-page.component";
import {AuthPageComponent} from "./auth-page/auth-page.component";
import {AuthGuard} from "./shared/classes/auth.guard";
import {TestFormPageComponent} from "./test-form-page/test-form-page.component";
import {TestResultPageComponent} from "./test-result-page/test-result-page.component";
import {UserPageComponent} from "./user-page/user-page.component";
import {AdminPageComponent} from "./admin-page/admin-page.component";

export const routes: Routes = [
  {
    path: '', component: BigLayoutComponent, children: [
      {path: '', redirectTo: '/main', pathMatch: 'full'},
      {path: 'main', component: MainPageComponent},
      {path: 'tests', component: TestsPageComponent},
      {path: 'test/new', component: TestFormPageComponent},
      {path: 'test/:id', component: TestPageComponent}, // {path: 'test/:id', component: TestPageComponent, canActivate: [AuthGuard]},
      {path: 'test/edit/:id', component: TestFormPageComponent},
      {path: 'result/:id', component: TestResultPageComponent}
    ]
  },
  {
    path: '', component: SmallLayoutComponent, children: [
      {path: 'auth', component: AuthPageComponent},
      {path: 'user', component: UserPageComponent},
      {path: 'admin', component: AdminPageComponent},
    ]
  }
];

