import { JSX } from 'react';
import { ReactService } from './ReactService';

export * from './ReactService';

declare global {
  interface IApp {
    $react: ReactService;
  }

  // IE-specific
  interface Document {
    attachEvent?: (event: string, listener: EventListener) => boolean;
    detachEvent?: (event: string, listener: EventListener) => void;
  }
}

export type TJSXElementChild = JSX.Element | React.ReactNode | undefined | null;
export type TJSXElementChildren = TJSXElementChild | TJSXElementChild[];
