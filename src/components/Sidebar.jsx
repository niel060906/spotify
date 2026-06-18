import React from 'react';
import { Home, Search, Library, Download, History, Heart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: Download, label: 'Downloads', path: '/downloads' },
    ];

    return (
        <aside className="w-64 bg-black flex flex-col h-full hidden md:flex border-r border-neutral-900">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2 text-white">
                    <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black">T</span>
                    Termux Music
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export function MobileNav() {
    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: Download, label: 'Downloads', path: '/downloads' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-800 z-40 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                                isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
