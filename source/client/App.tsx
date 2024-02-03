import './index.scss';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { CardHandler } from './home/Home';

function Page() {
  return <CardHandler />;
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
