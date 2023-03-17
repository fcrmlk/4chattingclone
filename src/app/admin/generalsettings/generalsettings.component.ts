import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-generalsettings',
  templateUrl: './generalsettings.component.html',
  styleUrls: ['./generalsettings.component.scss']
})
export class GeneralsettingsComponent implements OnInit {
  generalForm: FormGroup;
  generaldata: any;
  totalusers: any;
  totaluserscount: any;
  filter: any;
  key: any = '_id';
  reverse: Boolean = false;
  p: Number = 1;
  url: any;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private service: SitesettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private user: UserService,
  ) {
    this.generalForm = this.fb.group({
      site_title: ['', Validators.compose([Validators.required])],
      banner_text: [''],
      footer_text: [''],
      android_store: [''],
      ios_store: [''],
      facebook_link: [''],
      twitter_link: [''],
      google_link: [''],
      about_text: ['']
    });
  }

  ngOnInit() {
    this.getsitedata();
    this.url = environment.API_URL;
    this.user.getuserlist().subscribe(res => {
      this.totalusers = res.result;
      this.totaluserscount = res.count;
    });
  }


  getsitedata() {
    this.service.getsitedatasettings().subscribe(res => {
      this.generaldata = res.result;
    });
  }

  onGeneralFormSubmit(sitedatasettings) {
      if (this.generalForm.valid) {
      this.service.savesitesettings(sitedatasettings).subscribe(data => {
        if (data.status) {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/generalsettings']);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          window.scrollTo(0, 0);
          return false;
        }
      });
    } else {
      this.validateAllFormFields(this.generalForm);
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
    this.generalForm.reset();
  }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}
