import { ToasterService } from './ToasterService';

export * from './ToasterService';
export * from './Toasters';
export * from './Toaster';

export interface IToasterListener {
  toastersChanged: () => void;
}

export type TToastType = 'info' | 'success' | 'warning' | 'error';

declare global {
  interface IApp {
    $toaster: ToasterService;
  }
}
