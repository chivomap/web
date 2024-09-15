import React from 'react';
import './contextMenu.css';  // Archivo CSS

interface ContextMenuProps {
  x: number;
  y: number;
  closeMenu: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, closeMenu }) => {
  return (
    <div className="context-menu" style={{ top: `${y}px`, left: `${x}px` }} onMouseLeave={closeMenu}>
      <ul>
        <li onClick={() => console.log('Acción 1')}>Acción 1</li>
        <li onClick={() => console.log('Acción 2')}>Acción 2</li>
        <li onClick={() => console.log('Acción 3')}>Acción 3</li>
      </ul>
    </div>
  );
};
