import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    gradient: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, subtitle }) => {
    return (
        <div className={`${gradient} p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className="text-white/80">{icon}</div>
            </div>
        </div>
    );
};

export default StatCard;
