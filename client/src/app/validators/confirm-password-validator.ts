import { FormGroup } from '@angular/forms';

/**
 * Custom validator function to validate if the value of two form controls match.
 * This is typically used to ensure that fields like "password" and "confirm password" have the same value.
 *
 * @param controlName - The name of the first form control to compare.
 * @param controlNameToMatch - The name of the second form control to compare with the first one.
 * @returns A validator function that checks if the values of the two controls match.
 */
export const confirmPasswordValidator = (
  controlName: string,
  controlNameToMatch: string
) => {
  /**
   * The actual validator function.
   *
   * @param formGroup - The form group that contains the two controls to be compared.
   */
  return (formGroup: FormGroup) => {
    let control = formGroup.controls[controlName]; // Access the first control using its name.
    let controlToMatch = formGroup.controls[controlNameToMatch]; // Access the second control using its name.

    // If the control to match has errors but none of them is caused by this validator,
    // then exit early without setting any additional errors.
    if (
      controlToMatch.errors &&
      !controlToMatch.errors['confirmPasswordValidator']
    ) {
      return;
    }

    // If the values of the two controls don't match, set an error on the control to match.
    if (control.value != controlToMatch.value) {
      controlToMatch.setErrors({ confirmPasswordValidator: true });
    } else {
      // If the values do match, remove any errors related to this validator.
      controlToMatch.setErrors(null);
    }
  };
};
