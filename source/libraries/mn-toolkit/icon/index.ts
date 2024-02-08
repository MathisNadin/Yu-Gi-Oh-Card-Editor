import { IconService } from './IconService';

export * from './svgs';
export * from './IconService';
export * from './Icon';

declare global {
  interface ISvgIcons {}
  interface IApp {
    $icon: IconService;
  }
}
