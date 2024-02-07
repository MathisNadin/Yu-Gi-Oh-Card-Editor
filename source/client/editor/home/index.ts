export * from './HomeView';

declare global {
  interface IRouter {
    home: () => void;
  }
}
