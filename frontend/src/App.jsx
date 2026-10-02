import { Navigate, Route, Routes } from 'react-router-dom';
import { DemoPage } from './DemoPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vulnerable" replace />} />
      <Route path="/:mode" element={<DemoPage />} />
    </Routes>
  );
}
