import React, { lazy, memo, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const ComingSoon = lazy(() => import('../pages/ComingSoon'));
const PlaytestPage = lazy(() => import('../pages/Playtest'));
const ShopApp = lazy(() => import('./ShopApp'));

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

function App() {
  return (
    <Router basename={routerBasename}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ComingSoon />} />
          <Route path="/play" element={<PlaytestPage />} />
          <Route path="/play/:gameId" element={<PlaytestPage />} />
          <Route path="/*" element={<ShopApp />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default memo(App);
