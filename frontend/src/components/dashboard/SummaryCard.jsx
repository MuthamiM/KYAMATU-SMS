import React from 'react';

const SummaryCard = ({ title, data, color, icon: Icon, type }) => {
  // Config for different colors matching the mockup
  const colors = {
    blue: { header: 'bg-cyan-500', icon: 'text-cyan-500' },
    green: { header: 'bg-green-500', icon: 'text-green-500' },
    orange: { header: 'bg-orange-400', icon: 'text-orange-400' },
    red: { header: 'bg-red-500', icon: 'text-red-500' },
    cyan: { header: 'bg-cyan-400', icon: 'text-cyan-400' }, // For circular
  };

  const theme = colors[color] || colors.blue;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className={`${theme.header} px-4 py-2 flex justify-between items-center`}>
        <h3 className="text-white font-medium text-lg">{title}</h3>
        {Icon && <Icon className="text-white/80 w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-1 last:pb-0">
            <span className="text-gray-600 text-sm font-medium">{item.label}</span>
            <div className="flex items-center gap-2">
               {item.valueBadge ? (
                   <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${item.valueBadgeColor || theme.header}`}>
                       {item.value}
                   </span>
               ) : (
                   <span className="font-bold text-gray-800">{item.value}</span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;
