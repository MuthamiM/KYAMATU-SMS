import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];

export const StudentGrowthChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Number Of Students</h3>
          <button className="text-gray-400 hover:text-gray-600">☰</button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /> 
            {/* Using blue to match '2022-2023' bar in mockup, but mockup has multi-colored bars. 
                We can make a Cell loop if needed. For now single color is cleaner. 
            */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AttendancePieChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-lg">Present/Absent</h3>
        <button className="text-gray-400 hover:text-gray-600">☰</button>
      </div>
      <div className="h-64 relative">
         <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Present' ? '#22c55e' : '#ef4444'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text specific to mockup? No, mockup has standard pie */}
      </div>
    </div>
  );
};

export const FeeCollectionChart = ({ data }) => {
    return (
      <div className="bg-white p-4 shadow rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Fee Collected</h3>
            <button className="text-gray-400 hover:text-gray-600">☰</button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} /> 
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};
  
export const FeeDetailsPieChart = ({ data }) => {
    // data: [{name: 'Collected', value: x}, {name: 'Pending', value: y}]
    return (
      <div className="bg-white p-4 shadow rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Fee Details</h3>
          <button className="text-gray-400 hover:text-gray-600">☰</button>
        </div>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#3b82f6" /> {/* Pending? Mockup has Blue big chunk */}
                <Cell fill="#8b5cf6" /> {/* Collected? Mockup has Purple sliver */}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};
