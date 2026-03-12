import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Instagram, Sparkles, Building2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = data;
            const response = await authService.register(registerData);
            setUser(response.data.user);
            toast.success('Account created successfully! Welcome aboard! 🎉');
            navigate('/dashboard');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            toast.error(errorMessage);
            console.error('Registration error:', error);
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

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-glass-lg">
                        <Instagram className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Instagram DM Commerce
                    </h1>
                    <p className="text-gray-400">Start automating your Instagram DM responses</p>
                </div>

                {/* Registration Form */}
                <div className="glass-card p-8 animate-slide-up">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                    <p className="text-gray-400 mb-6">
                        Join thousands of businesses automating their Instagram DMs
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Company Name */}
                        <div>
                            <label htmlFor="companyName" className="input-label">
                                <Building2 className="w-4 h-4 inline mr-2" />
                                Company Name
                            </label>
                            <input
                                {...register('companyName')}
                                type="text"
                                id="companyName"
                                className="input-field"
                                placeholder="Acme Inc."
                                disabled={isLoading}
                            />
                            {errors.companyName && (
                                <p className="mt-1 text-sm text-red-400">{errors.companyName.message}</p>
                            )}
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="input-label">
                                    <User className="w-4 h-4 inline mr-2" />
                                    First Name
                                </label>
                                <input
                                    {...register('firstName')}
                                    type="text"
                                    id="firstName"
                                    className="input-field"
                                    placeholder="John"
                                    disabled={isLoading}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="lastName" className="input-label">
                                    Last Name
                                </label>
                                <input
                                    {...register('lastName')}
                                    type="text"
                                    id="lastName"
                                    className="input-field"
                                    placeholder="Doe"
                                    disabled={isLoading}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="input-label">
                                <Mail className="w-4 h-4 inline mr-2" />
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

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="input-label">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="input-field pr-20"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="input-label">
                                    Confirm Password
                                </label>
                                <input
                                    {...register('confirmPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    className="input-field"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-xs font-semibold text-gray-400 mb-2">Password must contain:</p>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>✓ At least 8 characters</li>
                                <li>✓ One uppercase letter</li>
                                <li>✓ One lowercase letter</li>
                                <li>✓ One number</li>
                            </ul>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900"
                                disabled={isLoading}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-400">
                                I agree to the{' '}
                                <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in">
                    {[
                        { icon: '🤖', text: 'Auto Replies' },
                        { icon: '📸', text: 'Product Carousels' },
                        { icon: '📊', text: 'Analytics' },
                    ].map((feature) => (
                        <div
                            key={feature.text}
                            className="glass-card p-4 text-center hover:scale-105 transition-transform"
                        >
                            <div className="text-2xl mb-2">{feature.icon}</div>
                            <p className="text-sm text-gray-400">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
