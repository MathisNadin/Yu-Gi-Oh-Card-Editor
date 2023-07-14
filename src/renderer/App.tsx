/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import './App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { CardHandler } from './card-handler/CardHandler';

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
