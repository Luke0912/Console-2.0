import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { instagramService } from '@/services/instagramService';
import {
    MessageCircle,
    Send,
    Eye,
    MousePointerClick,
    TrendingUp,
    AlertCircle,
    Instagram,
    Sparkles,
    Package,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
    const { data: summary, isLoading: summaryLoading } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => analyticsService.getSummary(),
    });

    const { data: dailyStats, isLoading: statsLoading } = useQuery({
        queryKey: ['daily-stats'],
        queryFn: () => analyticsService.getDailyStats(30),
    });

    const { data: instagramAccount } = useQuery({
        queryKey: ['instagram-account'],
        queryFn: () => instagramService.getAccountStatus(),
    });

    const { data: topProducts } = useQuery({
        queryKey: ['top-products'],
        queryFn: () => analyticsService.getTopProducts(5),
    });

    const stats = [
        {
            name: 'Total DMs',
            value: summary?.totalDMs || 0,
            icon: MessageCircle,
            color: 'from-blue-500 to-cyan-500',
            trend: '+12%',
        },
        {
            name: 'Carousels Sent',
            value: summary?.carouselsSent || 0,
            icon: Send,
            color: 'from-purple-500 to-pink-500',
            trend: '+8%',
        },
        {
            name: 'Impressions',
            value: summary?.productImpressions || 0,
            icon: Eye,
            color: 'from-green-500 to-emerald-500',
            trend: '+15%',
        },
        {
            name: 'Click-Through Rate',
            value: `${summary?.ctr || 0}%`,
            icon: MousePointerClick,
            color: 'from-orange-500 to-red-500',
            trend: '+2.3%',
        },
    ];

    if (summaryLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="glass-card p-6 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500/30">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Sparkles className="w-8 h-8" />
                            Welcome to your Dashboard
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Monitor your Instagram DM automation performance
                        </p>
                    </div>
                    {instagramAccount?.connected && (
                        <div className="badge badge-success flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            @{instagramAccount.account.username}
                        </div>
                    )}
                </div>
            </div>

            {/* Instagram Connection Warning */}
            {!instagramAccount?.connected && (
                <div className="glass-card p-6 border-yellow-500/30 bg-yellow-500/10">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Connect Your Instagram Account
                            </h3>
                            <p className="text-gray-300 mb-4">
                                To start automating DM responses, you need to connect your Instagram
                                Business Account.
                            </p>
                            <a href="/settings" className="btn-primary inline-flex items-center gap-2">
                                <Instagram className="w-5 h-5" />
                                Connect Instagram
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="stat-card">
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}
                            >
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="badge badge-success text-xs">{stat.trend}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{stat.name}</p>
                        <p className="text-3xl font-bold text-white">
                            {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DM Activity Chart */}
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        DM Activity (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyStats || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="dms"
                                stroke="#ec4899"
                                strokeWidth={2}
                                dot={false}
                                name="DMs"
                            />
                            <Line
                                type="monotone"
                                dataKey="carousels"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={false}
                                name="Carousels"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-secondary-400" />
                        Top Performing Products
                    </h3>
                    <div className="space-y-3">
                        {topProducts?.map((product: any, index: number) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                            >
                                <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{product.name}</p>
                                    <p className="text-sm text-gray-400">CTR: {product.ctr}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-primary-400">
                                        {formatNumber(product.clicks)}
                                    </p>
                                    <p className="text-xs text-gray-400">clicks</p>
                                </div>
                            </div>
                        )) || (
                                <p className="text-center text-gray-400 py-8">
                                    No product data yet. Add products to get started!
                                </p>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
