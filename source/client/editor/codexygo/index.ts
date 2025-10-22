import { CodexYgoService } from './CodexYgoService';

export * from './CodexYgoService';

declare global {
  interface IApp {
    $codexygo: CodexYgoService;
  }
}
