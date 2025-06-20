import { createContext } from 'react';
import { TFormField } from './FormField';

// Provides registration and notification methods for form fields.
export interface IFormContext {
  registerField(field: TFormField): void;
  unregisterField(field: TFormField): void;
  notifyFieldChange(field: TFormField): void;
  notifyFieldSubmit(field: TFormField): void;
}

export const FormContext = createContext<IFormContext | null>(null);
