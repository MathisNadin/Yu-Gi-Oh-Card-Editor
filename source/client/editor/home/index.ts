export * from './HomeView';
export * from './HomeLeftPane';
export * from './HomeCenterPane';
export * from './HomeRightPane';

declare global {
  interface IRouter {
    home: () => Promise<void>;
    toPleaseTheRouter: (options: { dummy: string }) => Promise<void>;
  }
}
