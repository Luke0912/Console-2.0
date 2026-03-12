import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Filter,
    BarChart3,
    MessageCircle,
    Send,
    Eye,
    MousePointerClick,
    ShoppingCart,
    Users,
    Clock,
    Target,
    Zap,
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

type DateRange = '7d' | '30d' | '90d' | 'all';

const COLORS = ['#ec4899', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const [showFilters, setShowFilters] = useState(false);

    // Queries
    const { data: summary } = useQuery({
        queryKey: ['analytics-summary', dateRange],
        queryFn: () => analyticsService.getSummary(),
    });

    const { data: dailyStats } = useQuery({
        queryKey: ['daily-stats', dateRange],
        queryFn: () => analyticsService.getDailyStats(getDaysFromRange(dateRange)),
    });

    const { data: topProducts } = useQuery({
        queryKey: ['top-products', dateRange],
        queryFn: () => analyticsService.getTopProducts(10),
    });

    const { data: conversionData } = useQuery({
        queryKey: ['conversion-data', dateRange],
        queryFn: () => analyticsService.getConversionFunnel(),
    });

    // Helper function
    function getDaysFromRange(range: DateRange): number {
        switch (range) {
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            case 'all': return 365;
            default: return 30;
        }
    }

    // Key metrics data
    const metrics = [
        {
            name: 'Total DMs',
            value: summary?.totalDMs || 0,
            change: '+12.5%',
            trend: 'up',
            icon: MessageCircle,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Carousels Sent',
            value: summary?.carouselsSent || 0,
            change: '+8.3%',
            trend: 'up',
            icon: Send,
            color: 'from-purple-500 to-pink-500',
        },
        {
            name: 'Total Impressions',
            value: summary?.productImpressions || 0,
            change: '+15.7%',
            trend: 'up',
            icon: Eye,
            color: 'from-green-500 to-emerald-500',
        },
        {
            name: 'Click-Through Rate',
            value: `${summary?.ctr || 0}%`,
            change: '+2.3%',
            trend: 'up',
            icon: MousePointerClick,
            color: 'from-orange-500 to-red-500',
        },
        {
            name: 'Conv. Rate',
            value: `${summary?.conversionRate || 0}%`,
            change: '+4.1%',
            trend: 'up',
            icon: Target,
            color: 'from-pink-500 to-rose-500',
        },
        {
            name: 'Avg. Response Time',
            value: '2.3s',
            change: '-15%',
            trend: 'up',
            icon: Clock,
            color: 'from-indigo-500 to-purple-500',
        },
        {
            name: 'Active Users',
            value: formatNumber(1234),
            change: '+18.2%',
            trend: 'up',
            icon: Users,
            color: 'from-teal-500 to-cyan-500',
        },
        {
            name: 'Total Revenue',
            value: formatCurrency(45678, 'USD'),
            change: '+22.4%',
            trend: 'up',
            icon: ShoppingCart,
            color: 'from-yellow-500 to-orange-500',
        },
    ];

    // Conversion funnel data
    const funnelData = [
        { stage: 'DM Received', value: 1000, percentage: 100 },
        { stage: 'Carousel Sent', value: 950, percentage: 95 },
        { stage: 'Product Viewed', value: 750, percentage: 75 },
        { stage: 'Product Clicked', value: 450, percentage: 45 },
        { stage: 'Converted', value: 180, percentage: 18 },
    ];

    // Product performance data
    const productPerformance = topProducts?.map((product: any, index: number) => ({
        name: product.name,
        impressions: product.metadata?.impressions || 0,
        clicks: product.metadata?.clicks || 0,
        conversions: product.metadata?.conversions || 0,
        ctr: product.ctr || 0,
    })) || [];

    // Engagement by hour
    const hourlyData = [
        { hour: '00:00', dms: 45, carousels: 38 },
        { hour: '03:00', dms: 23, carousels: 18 },
        { hour: '06:00', dms: 67, carousels: 54 },
        { hour: '09:00', dms: 189, carousels: 156 },
        { hour: '12:00', dms: 234, carousels: 201 },
        { hour: '15:00', dms: 198, carousels: 167 },
        { hour: '18:00', dms: 256, carousels: 223 },
        { hour: '21:00', dms: 178, carousels: 145 },
    ];

    // Export data
    const handleExport = () => {
        // In a real app, generate CSV/Excel
        alert('Export functionality - would download analytics data as CSV');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary-400" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Comprehensive insights into your Instagram DM automation performance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="flex items-center gap-2 bg-dark-800 border border-white/10 rounded-xl p-1">
                        {(['7d', '30d', '90d', 'all'] as DateRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' Days')}`}
                            </button>
                        ))}
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <div key={metric.name} className="stat-card group">
                        <div className="flex items-start justify-between mb-3">
                            <div
                                className={`p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}
                            >
                                <metric.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                {metric.trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                )}
                                <span className={metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                                    {metric.change}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{metric.name}</p>
                        <p className="text-2xl font-bold text-white">
                            {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DM Activity Over Time */}
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        DM Activity Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyStats || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                }
                            />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="dms"
                                stroke="#ec4899"
                                strokeWidth={3}
                                dot={{ fill: '#ec4899', r: 4 }}
                                name="DMs"
                            />
                            <Line
                                type="monotone"
                                dataKey="carousels"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                dot={{ fill: '#0ea5e9', r: 4 }}
                                name="Carousels"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Conversion Funnel */}
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-secondary-400" />
                        Conversion Funnel
                    </h3>
                    <div className="space-y-3">
                        {funnelData.map((stage, index) => (
                            <div key={stage.stage} className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-300">{stage.stage}</span>
                                    <span className="text-sm font-semibold text-white">
                                        {formatNumber(stage.value)} ({stage.percentage}%)
                                    </span>
                                </div>
                                <div className="h-10 bg-dark-700 rounded-xl overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl transition-all duration-500 flex items-center justify-center"
                                        style={{ width: `${stage.percentage}%` }}
                                    >
                                        <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {stage.percentage}%
                                        </span>
                                    </div>
                                </div>
                                {index < funnelData.length - 1 && (
                                    <div className="flex items-center justify-center my-1">
                                        <TrendingDown className="w-4 h-4 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products Performance */}
                <div className="dashboard-card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Top Products Performance
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productPerformance.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fontSize: 11 }}
                                angle={-15}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="impressions" fill="#8b5cf6" name="Impressions" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="clicks" fill="#ec4899" name="Clicks" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="conversions" fill="#10b981" name="Conversions" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Engagement by Time */}
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        Peak Hours
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                }}
                            />
                            <Bar dataKey="dms" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Product Rankings Table */}
            <div className="dashboard-card">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-400" />
                    Detailed Product Rankings
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-sm font-semibold text-gray-400 pb-3 pr-4">Rank</th>
                                <th className="text-left text-sm font-semibold text-gray-400 pb-3 pr-4">Product</th>
                                <th className="text-right text-sm font-semibold text-gray-400 pb-3 pr-4">Impressions</th>
                                <th className="text-right text-sm font-semibold text-gray-400 pb-3 pr-4">Clicks</th>
                                <th className="text-right text-sm font-semibold text-gray-400 pb-3 pr-4">Conv.</th>
                                <th className="text-right text-sm font-semibold text-gray-400 pb-3">CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts?.slice(0, 10).map((product: any, index: number) => (
                                <tr
                                    key={product._id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                                                        ? 'bg-yellow-500 text-black'
                                                        : index === 1
                                                            ? 'bg-gray-400 text-black'
                                                            : index === 2
                                                                ? 'bg-orange-600 text-white'
                                                                : 'bg-dark-700 text-gray-400'
                                                    }`}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-3">
                                            {product.images?.[0] && (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-semibold text-white text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {formatCurrency(product.price, product.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4 text-right text-white font-medium">
                                        {formatNumber(product.metadata?.impressions || 0)}
                                    </td>
                                    <td className="py-4 pr-4 text-right text-white font-medium">
                                        {formatNumber(product.metadata?.clicks || 0)}
                                    </td>
                                    <td className="py-4 pr-4 text-right text-white font-medium">
                                        {formatNumber(product.metadata?.conversions || 0)}
                                    </td>
                                    <td className="py-4 text-right">
                                        <span className="badge badge-success">{product.ctr || 0}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-1">Best Performing Day</h4>
                            <p className="text-2xl font-bold text-green-400 mb-1">Monday</p>
                            <p className="text-sm text-gray-400">342 DMs received, 89% carousel sent</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-1">Peak Hour</h4>
                            <p className="text-2xl font-bold text-blue-400 mb-1">6-7 PM</p>
                            <p className="text-sm text-gray-400">Highest engagement and conversions</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-purple-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-1">Top Category</h4>
                            <p className="text-2xl font-bold text-purple-400 mb-1">Electronics</p>
                            <p className="text-sm text-gray-400">45% of total conversions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
