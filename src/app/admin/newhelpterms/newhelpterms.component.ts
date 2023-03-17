import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HelpService } from '../../services/help.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-newhelpterms',
  templateUrl: './newhelpterms.component.html',
  styleUrls: ['./newhelpterms.component.scss']
})
export class NewhelptermsComponent implements OnInit {
  newhelpForm: FormGroup;
  editor_modules: any;
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private helpService: HelpService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.editor_modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean'],

        ['link', 'image']
      ]
    };
    this.newhelpForm = this.fb.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
      type: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required, Validators.minLength(3)])]
    });
  }
  onHelpFormSubmit(helpdata) {
    if (this.newhelpForm.valid) {
      this.helpService.addhelpterms(helpdata).subscribe(data => {
        if (data.status) {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.success(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/helpterms']);
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          window.scrollTo(0, 0);
          return false;
        }
      });
    } else {
      this.validateAllFormFields(this.newhelpForm);
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




