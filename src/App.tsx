import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar, { MobileNav } from './components/Sidebar';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Downloads from './pages/Downloads';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-black text-white h-screen overflow-hidden font-sans selection:bg-white/20 selection:text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative h-full">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/downloads" element={<Downloads />} />
            </Routes>
        </main>
        <Player />
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
