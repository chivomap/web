declare module 'pigeon-overlay' {
    import { ReactNode } from 'react';
  
    interface OverlayProps {
      anchor: [number, number];
      offset?: [number, number];
      children?: ReactNode;
    }
  
    const Overlay: React.FC<OverlayProps>;
    export default Overlay;
  }
  