import { ReactNode } from 'react';
import { ReactService } from './ReactService';

export * from './ReactService';

declare global {
  interface IApp {
    $react: ReactService;
  }
}

export type JSXElementChild = JSX.Element | ReactNode | undefined | null;
export type JSXElementChildren = JSXElementChild | JSXElementChild[];
