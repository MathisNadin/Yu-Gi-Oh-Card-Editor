import { install as stringInstall } from './string';
import { install as dateInstall } from './date';
import { install as eventInstall } from './event';
import { install as arrayInstall } from './array';

export function extendNativeObjects() {
  stringInstall();
  dateInstall();
  eventInstall();
  arrayInstall();
}
