import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authService.getCurrentUser();
            setProfileData(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                    {profileData?.profile?.avatar ? (
                                        <img
                                            src={`http://localhost:5000${profileData.profile.avatar}`}
                                            alt="Avatar"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        user?.name?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">{profileData?.user?.name}</h1>
                                    <p className="text-purple-100">{profileData?.user?.email}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                                        {profileData?.user?.role}
                                    </span>
                                </div>
                            </div>
                            <Link
                                to="/profile/edit"
                                className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                            >
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Bio */}
                        {profileData?.profile?.bio && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                                <p className="text-gray-300">{profileData.profile.bio}</p>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profileData?.profile?.phone && (
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Phone</p>
                                    <p className="text-white font-medium">{profileData.profile.phone}</p>
                                </div>
                            )}

                            {profileData?.profile?.location?.city && (
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Location</p>
                                    <p className="text-white font-medium">
                                        {profileData.profile.location.city}
                                        {profileData.profile.location.country && `, ${profileData.profile.location.country}`}
                                    </p>
                                </div>
                            )}

                            {profileData?.profile?.dateOfBirth && (
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Date of Birth</p>
                                    <p className="text-white font-medium">
                                        {new Date(profileData.profile.dateOfBirth).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div className="bg-white/5 p-4 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                                <p className="text-white font-medium">
                                    {new Date(profileData?.user?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Social Links */}
                        {profileData?.profile?.socialLinks && Object.keys(profileData.profile.socialLinks).length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Social Links</h3>
                                <div className="flex space-x-4">
                                    {profileData.profile.socialLinks.twitter && (
                                        <a
                                            href={profileData.profile.socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Twitter
                                        </a>
                                    )}
                                    {profileData.profile.socialLinks.linkedin && (
                                        <a
                                            href={profileData.profile.socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                                        >
                                            LinkedIn
                                        </a>
                                    )}
                                    {profileData.profile.socialLinks.github && (
                                        <a
                                            href={profileData.profile.socialLinks.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                                        >
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
