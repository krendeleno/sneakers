import type { CSSProperties, ReactNode, Ref } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': {
        ref?: Ref<HTMLElement>;
        src: string;
        poster?: string;
        alt?: string;
        'camera-controls'?: string;
        'auto-rotate'?: string;
        ar?: string;
        'shadow-intensity'?: string;
        className?: string;
        style?: CSSProperties;
        children?: ReactNode;
      };
    }
  }
}
