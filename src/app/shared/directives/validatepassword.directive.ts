import { Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appValidatepassword]'
})
export class ValidatepasswordDirective {

  static Match(firstControlName, secondControlName) {
    return (AC: AbstractControl) => {
      const firstControlValue = AC.get(firstControlName).value; // to get value in input tag
      const secondControlValue = AC.get(secondControlName).value; // to get value in input tag
      if (firstControlValue !== secondControlValue) {
        AC.get(secondControlName).setErrors({ MatchFields: true });
      } else {
        return null
      }
    };
  }
  constructor() { }

}
