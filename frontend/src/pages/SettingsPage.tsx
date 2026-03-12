import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { instagramService } from '@/services/instagramService';
import toast from 'react-hot-toast';
import {
    Instagram,
    CheckCircle,
    XCircle,
    ExternalLink,
    AlertTriangle,
    Calendar,
    Sparkles,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function SettingsPage() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const { data: accountStatus, isLoading, refetch } = useQuery({
        queryKey: ['instagram-account'],
        queryFn: () => instagramService.getAccountStatus(),
    });

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const { oauthUrl } = await instagramService.getOAuthUrl();
            window.location.href = oauthUrl;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to initiate connection');
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your Instagram account?')) {
            return;
        }

        setIsDisconnecting(true);
        try {
            await instagramService.disconnectAccount();
            toast.success('Instagram account disconnected');
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to disconnect');
        } finally {
            setIsDisconnecting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    const isConnected = accountStatus?.connected;
    const account = accountStatus?.account;
    const isTokenExpiringSoon =
        account?.tokenExpiresAt &&
        new Date(account.tokenExpiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="dashboard-card">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            <Sparkles className="w-7 h-7 text-primary-400" />
                            Settings
                        </h1>
                        <p className="text-gray-400">
                            Manage your Instagram connection and platform settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Instagram Connection */}
            <div className="dashboard-card">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                        <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white mb-1">
                            Instagram Business Account
                        </h2>
                        <p className="text-gray-400">
                            Connect your Instagram Business Account to enable automated DM responses
                        </p>
                    </div>
                </div>

                {isConnected ? (
                    <div className="space-y-4">
                        {/* Connection Status */}
                        <div className="glass-card p-4 border-green-500/30 bg-green-500/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                    <div>
                                        <p className="font-semibold text-white">Connected</p>
                                        <p className="text-sm text-gray-400">@{account.username}</p>
                                    </div>
                                </div>
                                <div className="badge badge-success">Active</div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-primary-400" />
                                    <p className="text-sm font-semibold text-gray-400">Token Expires</p>
                                </div>
                                <p className="text-white font-medium">
                                    {formatDateTime(account.tokenExpiresAt)}
                                </p>
                                {isTokenExpiringSoon && (
                                    <p className="text-yellow-400 text-sm mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-4 h-4" />
                                        Expiring soon - reconnect to refresh
                                    </p>
                                )}
                            </div>

                            <div className="glass-card p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-secondary-400" />
                                    <p className="text-sm font-semibold text-gray-400">Webhook Status</p>
                                </div>
                                <p className="text-white font-medium">
                                    {account.webhookSubscribed ? 'Subscribed' : 'Not Subscribed'}
                                </p>
                            </div>
                        </div>

                        {/* Last Sync */}
                        {account.lastSyncAt && (
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-sm text-gray-400">
                                    Last synced: {formatDateTime(account.lastSyncAt)}
                                </p>
                            </div>
                        )}

                        {/* Disconnect Button */}
                        <button
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                            className="btn-outline border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 flex items-center gap-2"
                        >
                            {isDisconnecting ? (
                                <>
                                    <span className="spinner" />
                                    Disconnecting...
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5" />
                                    Disconnect Account
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Not Connected */}
                        <div className="glass-card p-4 border-yellow-500/30 bg-yellow-500/10">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                <div>
                                    <p className="font-semibold text-white">Not Connected</p>
                                    <p className="text-sm text-gray-400">
                                        Connect your Instagram account to start automating DMs
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Connection Instructions */}
                        <div className="p-4 bg-white/5 rounded-xl space-y-3">
                            <p className="font-semibold text-white">Requirements:</p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Instagram Business or Creator account</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Connected to a Facebook Page</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Administrator access to the Facebook Page</span>
                                </li>
                            </ul>
                        </div>

                        {/* Connect Button */}
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            {isConnecting ? (
                                <>
                                    <span className="spinner" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Instagram className="w-5 h-5" />
                                    Connect Instagram Account
                                </>
                            )}
                        </button>

                        {/* Help Link */}
                        <a
                            href="https://developers.facebook.com/docs/instagram-api/getting-started"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Learn more about Instagram Business API
                        </a>
                    </div>
                )}
            </div>

            {/* Company Settings (Placeholder) */}
            <div className="dashboard-card">
                <h2 className="text-xl font-semibold text-white mb-4">Company Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="input-label">Company Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter company name"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="input-label">Auto-Reply Configuration</label>
                        <select className="input-field" disabled>
                            <option>Featured Products</option>
                            <option>Random Products</option>
                            <option>Newest Products</option>
                            <option>Top Sellers</option>
                        </select>
                    </div>
                    <p className="text-sm text-gray-400">
                        Additional settings coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
}
