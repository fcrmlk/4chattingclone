import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-appsettings',
  templateUrl: './appsettings.component.html',
  styleUrls: ['./appsettings.component.scss']
})
export class AppsettingsComponent implements OnInit {
  newsiteForm: FormGroup;
  newiosForm: FormGroup;
  sitedata: any;
  constructor(private fb: FormBuilder,
    public toastr: ToastrService,
    private service: SitesettingsService,
    private router: Router,
    private translate: TranslateService) { }

  ngOnInit() {
    this.newsiteForm = this.fb.group({
      android_version: ['', Validators.compose([Validators.required])],
      android_update: ['', Validators.compose([Validators.required])]
    });

    this.newiosForm = this.fb.group({
      ios_version: ['', Validators.compose([Validators.required])],
      ios_update: ['', Validators.compose([Validators.required])]
    });

    this.getsitedata();
  }

  getsitedata() {
    this.service.getsitedatasettings().subscribe(res => {
      this.sitedata = res.result;
    });
  }

  onSiteFormSubmit(sitedatasettings) {
    if (this.newsiteForm.valid) {
      this.service.savesitesettings(sitedatasettings).subscribe(data => {
        if (data.status) {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/appsettings']);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          window.scrollTo(0, 0);
          return false;
        }
      });
    } else {
      this.validateAllFormFields(this.newsiteForm);
    }
  }


  oniosFormSubmit(sitedatasettings) {
    if (this.newiosForm.valid) {
      this.service.savesitesettings(sitedatasettings).subscribe(data => {
        if (data.status) {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/appsettings']);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          window.scrollTo(0, 0);
          return false;
        }
      });
    } else {
      this.validateAllFormFields(this.newiosForm);
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
    this.newsiteForm.reset();
  }

  oniosFormReset() {
    this.newiosForm.reset();
  }

}

