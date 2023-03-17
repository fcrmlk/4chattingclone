import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  admindata: any;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private service: SitesettingsService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.pattern(/^\S*$/), Validators.minLength(3), Validators.maxLength(30)])],
      username: ['', Validators.compose([Validators.required, Validators.pattern(/\S+@\S+\.\S+/)])],
      newpassword: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(12)])],
      confirmpassword: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(12)])],
    });
  }

  ngOnInit() {
    this.getadmindata();
  }

  getadmindata() {
    this.service.getadminsettings().subscribe(res => {
      this.admindata = res.result;
    });
  }

  onGeneralFormSubmit(sitedatasettings) {
    if (this.profileForm.valid) {
      let message;
      if (sitedatasettings.newpassword !== '' && sitedatasettings.confirmpassword === '') {
        message = 'Please enter a confirm password';
        this.translate.get(message).subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
        });
        window.scrollTo(0, 0);
        return false;
      } else if (sitedatasettings.confirmpassword !== '' && sitedatasettings.newpassword === '') {
        message = 'Please enter a password';
        this.translate.get(message).subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
        });
        window.scrollTo(0, 0);
        return false;
      } else if ((sitedatasettings.confirmpassword !== null || sitedatasettings.newpassword !== null)
        && sitedatasettings.confirmpassword !== sitedatasettings.newpassword) {
        message = 'Password & Confirm Password does not match';
        this.translate.get(message).subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
        });
        window.scrollTo(0, 0);
        return false;
      } else {
        this.service.saveadminsettings(sitedatasettings).subscribe(data => {
          if (data.status) {
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.success(res, '', { 'timeOut': 3000 });
            });
            this.router.navigate(['admin/profile']);
          } else {
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.error(res, '', { 'timeOut': 3000 });
            });
            window.scrollTo(0, 0);
            return false;
          }
        });
      }
    } else {
      this.validateAllFormFields(this.profileForm);
    }
  }

  /* validate forms */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  };

  onFormReset() {
    this.router.navigate(['admin/dashboard']);
  };

  nospaceallowed(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32) {
      return false;
    }
    return true;
  };

}
