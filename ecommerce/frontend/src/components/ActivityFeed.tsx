import React from 'react';

interface Activity {
    id: string;
    type: string;
    message: string;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'login': return '🔑';
            case 'profile_update': return '👤';
            case 'order': return '📦';
            default: return '📌';
        }
    };

    const formatTime = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (!activities.length) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p>No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition">
                    <span className="text-2xl">{getIcon(activity.type)}</span>
                    <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs mt-1">{formatTime(activity.createdAt)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
