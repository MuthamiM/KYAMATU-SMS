import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardCalendar = () => {
    // A simplified visual calendar matching the mockup's style (May 2021 style)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Mock days for 2026/Current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Just a visual representation
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button>
                    <button className="px-2 py-0.5 text-xs bg-gray-100 rounded text-gray-600">today</button>
                </div>
                <h3 className="font-bold text-lg text-gray-800">{currentMonth} {currentYear}</h3>
                <div className="flex gap-1 text-xs">
                    <button className="px-2 py-1 bg-gray-200 rounded text-gray-700">month</button>
                    <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">week</button>
                    <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">day</button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 text-center mb-2">
                {weekDays.map(d => <div key={d} className="text-xs font-bold text-gray-500 py-1">{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1 h-48 overflow-y-auto custom-scrollbar">
               {/* 30 days visual mock */}
               {Array.from({length: 30}).map((_, i) => (
                   <div key={i} className="min-h-[40px] border border-gray-100 p-1 flex items-start justify-end relative">
                       <span className="text-xs text-gray-400">{i+1}</span>
                       {/* Random Event Badges */}
                       {i === 5 && <div className="absolute inset-0 bg-green-500 m-0.5 text-[8px] text-white p-0.5 leading-tight overflow-hidden rounded-sm">6:30p Agendra</div>}
                       {i === 12 && <div className="absolute inset-0 bg-orange-400 m-0.5 text-[8px] text-white p-0.5 leading-tight overflow-hidden rounded-sm">Event Arranged</div>}
                   </div>
               ))}
            </div>
        </div>
    );
};

export default DashboardCalendar;
