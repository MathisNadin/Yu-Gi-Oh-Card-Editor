type TStyles = Record<string, string>;

declare module '*.svg' {
  import React = require('react');

  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: TStyles;
  export default content;
}

declare module '*.sass' {
  const content: TStyles;
  export default content;
}

declare module '*.css' {
  const content: TStyles;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.md' {
  const content: string;
  export default content;
}
