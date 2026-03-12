import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Instagram, Sparkles } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            setUser(response.data.user);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-glass-lg">
                        <Instagram className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Instagram DM Commerce
                    </h1>
                    <p className="text-gray-400">Automate your Instagram DM responses</p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-8 animate-slide-up">
                    <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="input-label">
                                Email Address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                id="email"
                                className="input-field"
                                placeholder="you@company.com"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="input-label">
                                Password
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                id="password"
                                className="input-field"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in">
                    {['Auto Replies', 'Product Carousels', 'Analytics'].map((feature) => (
                        <div key={feature} className="text-center">
                            <p className="text-sm text-gray-400">{feature}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
