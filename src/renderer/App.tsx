/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import './App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { CardPreview } from './card-preview/CardPreview';
import { CardOptions } from './card-options/CardOptions';
import { BatchDisplay } from './batch-display/BatchDisplay';
import { VerticalStack } from 'mn-toolkit/containable/VerticalStack';

/* function Hello() {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
} */

function Page() {
  return <VerticalStack className='page'>
    <CardOptions />
    <CardPreview />
    <BatchDisplay />
  </VerticalStack>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page />} />
      </Routes>
    </Router>
  );
}
