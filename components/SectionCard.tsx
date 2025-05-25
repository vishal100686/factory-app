
import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <section className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-4">
        {icon && <span className="mr-3 text-indigo-600">{icon}</span>}
        <h3 className="text-xl sm:text-2xl font-semibold text-indigo-700">{title}</h3>
      </div>
      <div className="text-slate-700 text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
};

export default SectionCard;
