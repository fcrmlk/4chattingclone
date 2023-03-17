import { Directive } from '@angular/core';
import {NG_VALIDATORS, Validator, FormControl} from '@angular/forms';

@Directive({
  selector: '[appFileupload]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: FileuploadDirective, multi: true },
]
})
export class FileuploadDirective implements Validator {

  static validate(c: FormControl): {[key: string]: any} {
    return c.value == null || c.value.length === 0 ? { 'required' : true} : null;
  }

  validate(c: FormControl): {[key: string]: any} {
    return FileuploadDirective.validate(c);
  }

  constructor() { }
}



