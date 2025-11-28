import { CodexYgoService } from './CodexYgoService';

export * from './CodexYgoService';
export * from './CodexYgoCardListDialog';
export * from './LinkArrowsEditor';

declare global {
  interface IApp {
    $codexygo: CodexYgoService;
  }
}
