import { FC } from 'react';
import { TCodexYgoCardLinkArrow } from './interfaces';

const ARROW_POSITIONS: Array<{ id: TCodexYgoCardLinkArrow | 'center'; label: string }> = [
  { id: 'topLeft', label: 'Haut-Gauche' },
  { id: 'top', label: 'Haut' },
  { id: 'topRight', label: 'Haut-Droite' },
  { id: 'left', label: 'Gauche' },
  { id: 'center', label: '' },
  { id: 'right', label: 'Droite' },
  { id: 'bottomLeft', label: 'Bas-Gauche' },
  { id: 'bottom', label: 'Bas' },
  { id: 'bottomRight', label: 'Bas-Droite' },
];

interface ILinkArrowsEditorProps {
  // Current active arrows
  value: TCodexYgoCardLinkArrow[];
  // Called whenever arrows change
  onChange: (value: TCodexYgoCardLinkArrow[]) => void;
}

const CORNER_ARROWS: TCodexYgoCardLinkArrow[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

type SvgConfig = {
  viewBox: string;
  points: string;
};

// Return proper viewBox & polygon points per arrow
const getSvgConfig = (pos: TCodexYgoCardLinkArrow): SvgConfig => {
  // Corners: square 34x34, with a small inner margin to avoid clipping
  if (CORNER_ARROWS.includes(pos)) {
    return {
      viewBox: '0 0 34 34',
      // Right isosceles triangle, legs ~32, inset by 3 units
      points: '3,3 31,3 3,31',
    };
  }

  // Cardinals with the right proportions:
  // Base size reference: 94x94
  // - top/bottom: 44x24
  // - left/right: 24x44
  switch (pos) {
    case 'top':
      return {
        viewBox: '0 0 44 24',
        // Tip at top-center, base towards inside, with small margin (2 units)
        points: '22,2 2,22 42,22',
      };
    case 'bottom':
      return {
        viewBox: '0 0 44 24',
        // Mirrored vertically
        points: '2,2 42,2 22,22',
      };
    case 'left':
      return {
        viewBox: '0 0 24 44',
        // Tip at left-center, base vertical towards inside
        points: '2,22 22,2 22,42',
      };
    case 'right':
      return {
        viewBox: '0 0 24 44',
        // Mirrored horizontally
        points: '22,22 2,2 2,42',
      };
    default:
      // Fallback (should not happen)
      return {
        viewBox: '0 0 10 10',
        points: '0,0 10,0 0,10',
      };
  }
};

export const LinkArrowsEditor: FC<ILinkArrowsEditorProps> = ({ value, onChange }) => {
  // Handle toggle for a single position
  const handleToggle = (arrow: TCodexYgoCardLinkArrow) => {
    const newValue = value.includes(arrow) ? value.filter((l) => l !== arrow) : [...value, arrow];
    onChange(newValue);
  };

  return (
    <div className='mn-link-arrows-editor'>
      {ARROW_POSITIONS.map((slot) => {
        if (slot.id === 'center') {
          return <div key='center' className='link-arrows-cell link-arrows-cell--center' />;
        }

        const pos = slot.id;
        const checked = value.includes(pos);
        const id = `link-arrow-${pos}`;
        const isCorner = CORNER_ARROWS.includes(pos);
        const { viewBox, points } = getSvgConfig(pos);

        return (
          <div key={pos} className={`link-arrows-cell link-arrows-cell--${pos}`}>
            {/* Visually hidden but accessible checkbox */}
            <input
              id={id}
              type='checkbox'
              className='link-arrows-checkbox'
              checked={checked}
              onChange={() => handleToggle(pos)}
              aria-label={slot.label}
            />

            {/* Visible clickable triangle */}
            <label
              htmlFor={id}
              className={`link-arrows-triangle link-arrows-triangle--${pos} ${
                isCorner ? 'link-arrows-triangle--corner' : 'link-arrows-triangle--cardinal'
              }`}
            >
              {/* SVG used to create a sharp scalable triangle */}
              <svg viewBox={viewBox} className='link-arrows-svg' aria-hidden='true'>
                <polygon points={points} className='link-arrows-shape' />
              </svg>
            </label>
          </div>
        );
      })}
    </div>
  );
};
