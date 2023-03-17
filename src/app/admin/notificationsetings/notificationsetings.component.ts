import { Component, OnInit, ViewContainerRef, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notificationsetings',
  templateUrl: './notificationsetings.component.html',
  styleUrls: ['./notificationsetings.component.scss']
})
export class NotificationsetingsComponent implements OnInit {
  mailForm: FormGroup;
  sitedata: any;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private service: SitesettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private elem: ElementRef,
    private translate: TranslateService
  ) {
    this.mailForm = this.fb.group({
      fcm_key: [''],
      voip_passpharse: ['']
    });
  }

  ngOnInit() {
    this.getsitedata();
  }

  getsitedata() {
    this.service.getsitedatasettings().subscribe(res => {
      this.sitedata = res.result;
    });
  }

  onGeneralFormSubmit(sitedatasettings) {
    if (this.mailForm.valid) {
      this.service.savesitesettings(sitedatasettings).subscribe(data => {
        if (data.status) {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/notificationmanager']);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          window.scrollTo(0, 0);
          return false;
        }
      });
    } else {
      this.validateAllFormFields(this.mailForm);
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

  uploadVoip(Form) {
    const files = this.elem.nativeElement.querySelector('#voip_certificate_file').files;
    if (!this.validateFile(files[0].name)) {
      this.translate.get('Kindly upload a valid file (.pem format)').subscribe((res: string) => {
        this.toastr.error(res, '', { 'timeOut': 3000 });
      });
      this.elem.nativeElement.querySelector('#voip_certificate_file').value = '';
      return false;
    } else {
      const fData: FormData = new FormData;
      const file = files[0];
      fData.append('voip_cer', file, file.name);
      this.service.uploadapns(fData).subscribe(data => {
        if (data.status) {
          this.getsitedata();
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/notificationmanager/']);
          window.scrollTo(0, 0)
          this.elem.nativeElement.querySelector('#voip_certificate_file').value = '';
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          this.elem.nativeElement.querySelector('#voip_certificate_file').value = '';
        }
      });
    }
  }

  uploadVoipKey(Form) {
    const files = this.elem.nativeElement.querySelector('#voip_key_file').files;
    if (!this.validateFile(files[0].name)) {
      this.translate.get('Kindly upload a valid file (.pem format)').subscribe((res: string) => {
        this.toastr.error(res, '', { 'timeOut': 3000 });
      });
      this.elem.nativeElement.querySelector('#voip_key_file').value = '';
      return false;
    } else {
      const fData: FormData = new FormData;
      const file = files[0];
      fData.append('voip_key', file, file.name);
      this.service.uploadvoipkey(fData).subscribe(data => {
        if (data.status) {
          this.getsitedata();
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.elem.nativeElement.querySelector('#voip_key_file').value = '';
          this.router.navigate(['admin/notificationmanager/']);
          window.scrollTo(0, 0);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          this.elem.nativeElement.querySelector('#voip_key_file').value = '';
        }
      });
    }
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'pem') {
      return true;
    } else {
      return false;
    }
  }

  onFormReset() {
    this.mailForm.reset();
  }

}
