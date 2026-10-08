import { Navigate, Route, Routes } from 'react-router-dom';
import { DemoPage } from './pages/DemoPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/protected" replace />} />
      <Route path="/:mode" element={<DemoPage />} />
    </Routes>
  );
}
