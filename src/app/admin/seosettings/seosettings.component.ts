import { Component, OnInit, ElementRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from './../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

const API_URL = environment.API_URL;

@Component({
  selector: 'app-seosettings',
  templateUrl: './seosettings.component.html',
  styleUrls: ['./seosettings.component.scss']
})
export class SeosettingsComponent implements OnInit {
  seoForm: FormGroup;
  sitedata: any;
  url: any;
  metaimage: any;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private service: SitesettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private elem: ElementRef,
    private translate: TranslateService
  ) {
    this.seoForm = this.fb.group({
      meta_title: ['', Validators.compose([Validators.required])],
      meta_keywords: ['', Validators.compose([Validators.required])],
      meta_description: ['', Validators.compose([Validators.required])],
      meta_url: ['', Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    this.getsitedata();
    this.url = environment.API_URL;
  }

  getsitedata() {
    this.service.getsitedatasettings().subscribe(res => {
      this.sitedata = res.result;
      this.metaimage = (typeof this.sitedata.meta_image! !== 'undefined') ?
        API_URL + '/assets/public/seo/' + this.sitedata.meta_image : ' ';
    });
  }

  onGeneralFormSubmit(sitedatasettings) {
    if (this.seoForm.valid) {
      this.service.savesitesettings(sitedatasettings).subscribe(data => {
        if (data.status) {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/seomanager']);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          window.scrollTo(0, 0);
          return false;
        }
      });
    } else {
      this.validateAllFormFields(this.seoForm);
    }
  }


  fileupload(event) {
    const files = this.elem.nativeElement.querySelector('#seo_image').files;
    if (!this.validateFile(files[0].name)) {
      this.translate.get('Kindly upload jpg ,png (or) jpeg images for images').subscribe((res: string) => {
        this.toastr.error(res, '', { 'timeOut': 3000 });
      });
      return false;
    } else {
      const fData: FormData = new FormData;
      const file = files[0];
      fData.append('meta_image', file, file.name);
      this.service.uploadMetaimage(fData).subscribe(data => {
        if (data.status) {
          this.getsitedata();
          this.resetinput();
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/seomanager/']);
          window.scrollTo(0, 0);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
        }
      });
    }
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'jpeg') {
      return true;
    } else {
      return false;
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
    this.seoForm.reset();
  };

  resetinput() {
    this.elem.nativeElement.querySelector('#seo_image').value = '';
  }

}
