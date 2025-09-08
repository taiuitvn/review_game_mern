import React from 'react';

const StatsCard = ({ title, value, icon, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{value}</p>
        </div>
        {icon && (
          <div className="text-4xl text-indigo-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
