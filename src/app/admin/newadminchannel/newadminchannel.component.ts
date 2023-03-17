import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { FileuploadDirective } from '../../shared/directives/fileupload.directive';
import { PreventDoubleSubmitModule } from 'ngx-prevent-double-submission';
@Component({
  selector: 'app-newadminchannel',
  templateUrl: './newadminchannel.component.html',
  styleUrls: ['./newadminchannel.component.scss']
})

export class NewadminchannelComponent implements OnInit {
  newhelpForm: FormGroup;
  helpdata: any;
  disableButton: boolean;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService,
    private service: SitesettingsService,
    private router: Router,
    private translate: TranslateService,
    private elem: ElementRef
  ) { }

  ngOnInit() {
    this.newhelpForm = this.fb.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
      description: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(250)])],
      channel_image: new FormControl('', [FileuploadDirective.validate])
    });
  }

  onHelpFormSubmit(helpdata) {

    if (this.newhelpForm.valid) {
      const files = this.elem.nativeElement.querySelector('#channel_image').files;
      const channel_title = this.elem.nativeElement.querySelector('#title').value;
      const channel_desc = this.elem.nativeElement.querySelector('#description').value;
      if (!this.validateFile(files[0].name)) {
        this.translate.get('Kindly upload jpg ,png (or) jpeg images for images').subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
     
        });
        return false;
      } else {
        $('button[type=submit], input[type=submit]').prop('disabled',true);
        const fData: FormData = new FormData;
        const file = files[0];
        fData.append('admin_channel_image', file, file.name);
        fData.append('title', channel_title);
        fData.append('description', channel_desc);
        this.service.newAdminChannel(fData).subscribe(data => {
          if (data.status) {
            this.onFormReset();
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.success(res, '', { 'timeOut': 3000 });
               $('button[type=submit], input[type=submit]').prop('disabled',false);
            });
          } else {
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.error(res, '', { 'timeOut': 3000 });
               $('button[type=submit], input[type=submit]').prop('disabled',false);
            });
            window.scrollTo(0, 0);
            return false;
          }

        });
      }
   
    } else {
      this.validateAllFormFields(this.newhelpForm);
   
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
    this.newhelpForm.reset();
  }

}
