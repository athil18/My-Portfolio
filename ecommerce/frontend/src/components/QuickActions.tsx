import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
    const actions = [
        { label: 'Edit Profile', to: '/profile/edit', icon: '✏️', color: 'bg-purple-600 hover:bg-purple-700' },
        { label: 'View Orders', to: '/orders', icon: '📦', color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Browse Products', to: '/products', icon: '🛍️', color: 'bg-pink-600 hover:bg-pink-700' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action) => (
                <Link
                    key={action.to}
                    to={action.to}
                    className={`${action.color} p-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition transform hover:scale-105`}
                >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                </Link>
            ))}
        </div>
    );
};

export default QuickActions;
