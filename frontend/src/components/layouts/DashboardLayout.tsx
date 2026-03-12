import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Package,
    BarChart3,
    Settings,
    LogOut,
    Instagram,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout: logoutStore } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await authService.logout();
            logoutStore();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 glass-card transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
                            <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">IG DM Commerce</h1>
                            <p className="text-xs text-gray-400">SaaS Platform</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                            ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.firstName[0]}{user?.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 glass-card px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1 lg:flex-none">
                            <h2 className="text-xl font-bold text-white">
                                {navigation.find((item) => item.href === location.pathname)?.name ||
                                    'Dashboard'}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
