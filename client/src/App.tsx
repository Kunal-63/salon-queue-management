import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { JoinQueue } from './pages/JoinQueue';
import { MyStatus } from './pages/MyStatus';
import { Reception } from './pages/Reception';
import { BarberView } from './pages/BarberView';
import { DisplayTV } from './pages/DisplayTV';
import { AdminSettings } from './pages/AdminSettings';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#111827] text-gray-100 flex flex-col font-sans">
          <Header />
          <main className="flex-1 pb-12">
            <Routes>
              {/* Screen 1: Home */}
              <Route path="/" element={<Home />} />

              {/* Screen 2: Join Queue */}
              <Route path="/join" element={<JoinQueue />} />

              {/* Screen 3: My Status */}
              <Route path="/status/:id" element={<MyStatus />} />

              {/* Screen 4: Reception Dashboard */}
              <Route path="/reception" element={<Reception />} />

              {/* Screen 5: Barber View */}
              <Route path="/barber/:name" element={<BarberView />} />
              <Route path="/barber" element={<Navigate to="/barber/Ravi" replace />} />

              {/* Screen 6: Waiting Area TV */}
              <Route path="/display" element={<DisplayTV />} />

              {/* Screen 7: Owner Settings */}
              <Route path="/admin" element={<AdminSettings />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
