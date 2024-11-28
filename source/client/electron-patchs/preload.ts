declare global {
  interface IIpcRenderer {}
}

export function getProjectIpcRenderer(): Partial<IIpcRenderer> {
  return {};
}
