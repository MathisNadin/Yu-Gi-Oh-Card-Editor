import { TFormField } from './FormField';

export * from './Form';
export * from './FormField';

export interface IFormFieldListener {
  formFieldValidated(field: TFormField): void;
  formFieldSubmit(field: TFormField): void;
}
