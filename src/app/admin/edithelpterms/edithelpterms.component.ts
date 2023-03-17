import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component';
import { HelpService } from '../../services/help.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edithelpterms',
  templateUrl: './edithelpterms.component.html',
  styleUrls: ['./edithelpterms.component.scss']
})
export class EdithelptermsComponent implements OnInit {
  edithelpForm: FormGroup;
  edithelpdata: any;
  editor_modules: any;
  @ViewChild('description') description: QuillEditorComponent
  constructor(
    private fb: FormBuilder,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private helpService: HelpService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
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
    this.edithelpForm = this.fb.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
      type: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required, Validators.minLength(3)])]
    });

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.edithelpdata = this.helpService.edithelpterms(params['id']).subscribe(data => {
        if (data.status) {
          this.edithelpdata = data.result;
        } else {
          this.translate.get(data.message).subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          this.router.navigate(['admin/helpterms']);
        }
      });
    });
  }

  setFocus($event) {
    $event.focus();
  }

  onHelpFormSubmit(helpdata) {
    this.route.params.subscribe(params => {
      if (this.edithelpForm.valid) {
        this.helpService.updatehelpterms(helpdata, params['id']).subscribe(data => {
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
        this.validateAllFormFields(this.edithelpForm);
      }
    });
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
    this.router.navigate(['admin/helpterms']);
  }

}









