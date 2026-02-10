import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Phone, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">my Profile</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="h-32 bg-primary-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex items-end -mt-12 mb-6">
                        <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-primary-500 flex items-center justify-center text-3xl font-bold text-white">
                            {user?.firstName?.[0] || 'U'}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user?.firstName} {user?.lastName}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.role?.replace('_', ' ')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                                    Contact Information
                                </h3>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span>{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span>{user?.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                                    Account Information
                                </h3>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <span>User ID: {user?.id}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                    <span>Role: {user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
