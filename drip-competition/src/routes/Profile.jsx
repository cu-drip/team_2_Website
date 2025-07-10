import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../contexts/AuthContext.jsx";
import "./Profile.css";
import {Camera, Edit3, Mail, Save, Settings, Shield, User, X} from 'lucide-react';

export default function Profile() {
    const {user, updateUser, accessToken} = useAuth();
    const navigator = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!accessToken)
            navigator("/login");
    }, [accessToken, navigator]);

    const [formData, setFormData] = useState({
        name: (user?.name + (user?.surname || '') + (user?.patronymic || '')) || '',
        email: user?.email || '',
        bio: user?.bio || '',
        phoneNumber: user?.phoneNumber || ''
    });

    useEffect(() => {
        setFormData(prev => ({
            ...prev, ...user,
            name: (user?.surname + ' ' + user?.name + ' ' + (user?.patronymic || '')) || ''
        }));
    }, [user]);

    const handleSave = () => {
        updateUser({
            name: formData.name.split(" ")[1],
            surname: formData.name.split(" ")[0],
            patronymic: formData.name.split(" ")[2],
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            bio: formData.bio
        });
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const tabs = [
        {id: 'profile', name: 'Profile', icon: User},
        {id: 'settings', name: 'Settings', icon: Settings},
        {id: 'security', name: 'Security', icon: Shield}
    ];

    return (
        <div className="min-h-screen bg-[#121212] text-[#E0E0E0] py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E] mb-8">
                    <div className="p-8">
                        <div
                            className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <div className="relative">
                                <img
                                    src={user?.avatarUrl}
                                    alt={user?.name}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <button
                                    className="absolute bottom-0 right-0 bg-[#BB86FC] text-white p-2 rounded-full hover:bg-[#9A6BDB] transition-colors">
                                    <Camera className="h-4 w-4"/>
                                </button>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl font-bold text-[#E0E0E0]">{user?.name}</h1>
                                <p className="text-[#A3A3A3]">{user?.email}</p>
                                <p className="text-[#A3A3A3] mt-2">{formData.bio}</p>
                            </div>

                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Save className="h-4 w-4"/>
                                            <span>Save</span>
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="bg-[#CF6679] text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors flex items-center space-x-2"
                                        >
                                            <X className="h-4 w-4"/>
                                            <span>Cancel</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-[#BB86FC] text-white px-4 py-2 rounded-lg hover:bg-[#9A6BDB] transition-colors flex items-center space-x-2"
                                    >
                                        <Edit3 className="h-4 w-4"/>
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E]">
                    <div className="border-b border-[#2E2E2E]">
                        <nav className="flex space-x-8 px-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-[#BB86FC] text-[#BB86FC]'
                                            : 'border-transparent text-[#A3A3A3] hover:text-[#E0E0E0] hover:border-gray-500'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4"/>
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-[#A3A3A3]"/>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#2E2E2E] rounded-lg focus:ring-2 focus:ring-[#BB86FC] focus:border-transparent disabled:bg-[#2E2E2E] disabled:text-[#A3A3A3]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-[#A3A3A3]"/>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#2E2E2E] rounded-lg focus:ring-2 focus:ring-[#BB86FC] focus:border-transparent disabled:bg-[#2E2E2E] disabled:text-[#A3A3A3]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 bg-[#121212] border border-[#2E2E2E] rounded-lg focus:ring-2 focus:ring-[#BB86FC] focus:border-transparent disabled:bg-[#2E2E2E] disabled:text-[#A3A3A3]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="w-full px-4 py-2 bg-[#121212] border border-[#2E2E2E] rounded-lg focus:ring-2 focus:ring-[#BB86FC] focus:border-transparent disabled:bg-[#2E2E2E] disabled:text-[#A3A3A3]"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4">Account Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-[#121212] border border-[#2E2E2E] rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-[#E0E0E0]">Tournament Invitations</h4>
                                                <p className="text-sm text-[#A3A3A3]">Allow others to invite you to tournaments</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked/>
                                                <div
                                                    className="w-11 h-6 bg-[#2E2E2E] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9A6BDB] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#A3A3A3] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BB86FC]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4">Security Settings</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-[#121212] border border-[#2E2E2E] rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-[#E0E0E0]">Change Password</h4>
                                                <button className="text-[#BB86FC] hover:text-[#9A6BDB] text-sm font-medium">
                                                    Update
                                                </button>
                                            </div>
                                            <p className="text-sm text-[#A3A3A3]">
                                                Last updated: 2 months ago
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}