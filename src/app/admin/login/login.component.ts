import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { environment } from "./../../../environments/environment";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from "@angular/forms";
import { AuthenticationService } from "../../services/authentication.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { SitesettingsService } from "../../services/sitesettings.service";
import { TranslateService } from "@ngx-translate/core";

const API_URL = environment.API_URL;

@Component({
  selector: "app-login-page",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  sitedata: any;
  sitelogo: any;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService,
    vcr: ViewContainerRef,
    private authService: AuthenticationService,
    private router: Router,
    private translate: TranslateService,
    private service: SitesettingsService
  ) {
    if (this.authService.loggedIn) {
      this.router.navigate(["admin/dashboard"]);
    }
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      admin_username: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/\S+@\S+\.\S+/)
        ])
      ],
      admin_password: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
          Validators.pattern(/^\S*$/)
        ])
      ]
    });
    this.getsitedata();
  }

  getsitedata() {
    this.service.getsitedatasettings().subscribe(res => {
      this.sitedata = res.result;
      this.sitelogo = API_URL + "/assets/public/logos/" + res.result.logo;
    });
  }

  onLoginFormSubmit(admindata) {
    if (this.loginForm.valid) {
      this.authService.authenticateAdmin(admindata).subscribe(data => {
        if (data.status === "success") {
          this.authService.storeUserData(data.token, data.userdata);
          this.translate.get("Welcome").subscribe((res: string) => {
            this.toastr.success(res + data.nickname, "", { timeOut: 3000 });
          });
          this.router.navigate(["admin/dashboard"]);
        } else {
          this.translate
            .get("Invalid username or password")
            .subscribe((res: string) => {
              this.toastr.error(res, "", { timeOut: 3000 });
            });
          this.router.navigate(["admin"]);
        }
      });
    } else {
      this.validateAllFormFields(this.loginForm);
    }
  }

  /* VALIDATE FORMS */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  onLoginFormReset() {
    this.loginForm.reset();
  }
}
