import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const LoginPageNew = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

const images = [
  {
    src: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1600&auto=format&fit=crop",
    title: "Industrial Wires & Cables",
    subtitle: "Premium quality cables for railway, metro, and infrastructure projects",
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop",
    title: "RFP Data Ingestion",
    subtitle: "Automated scanning of procurement portals and tender websites",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
    title: "Smart SKU Matching",
    subtitle: "AI-powered technical specification matching for accurate proposals",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop",
    title: "Testing & Compliance",
    subtitle: "Comprehensive test requirements tracking (Acceptance, Quality, Routine, Safety)",
  },
  {
    src: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1600&auto=format&fit=crop",
    title: "End-to-End Workflow",
    subtitle: "Sales Agent → Technical Agent → Pricing Agent orchestration",
  }
];

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@demo.com');
    setPassword('WirePro2025!Demo');
    setError('');
    setError('Demo credentials loaded! Click "Sign in" to continue.');
    setTimeout(() => setError(''), 3000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-background-light via-background to-primary/10 overflow-hidden">
      {/* Left side - Login Form */}
      <div className="w-full md:w-2/5 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="max-w-md w-full space-y-4 sm:space-y-5 relative z-10 animate-fade-in">
          <div className="text-center transform ">
            <div className="flex justify-center">
              <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
                  <rect x="3" y="16" width="30" height="4" rx="2" fill="#3558A6" />
                  <circle cx="6" cy="18" r="3" fill="#FDB813" />
                  <circle cx="30" cy="18" r="3" fill="#FDB813" />
                  <rect x="8" y="13" width="20" height="10" rx="5" fill="#9CA3AF" opacity=".6" />
                </svg>
              </span>
            </div>
            <h2 className="mt-2 sm:mt-3 text-center text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Sign in to WirePro
            </h2>
          </div>
        
          <div className="bg-white/80 backdrop-blur-lg py-4 px-4 shadow-xl rounded-2xl border border-primary/20 sm:py-5 sm:px-6 lg:px-8">
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-md text-sm ${
                error.includes('credentials loaded') 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm sm:text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm sm:text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
           

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex justify-center items-center px-4 py-2.5 border border-primary/30 rounded-md text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Demo Login
              </button>
            </div>
          </form>

         
        </div>

        <div className="text-center text-xs text-gray-500 px-4 mt-3">
          <p>© 2025 WirePro. All rights reserved.</p>
        </div>
        </div>
      </div>

      {/* Right side - Image Slider */}
      <div className="hidden md:flex w-3/5 relative overflow-hidden bg-gradient-to-br from-primary/90 to-secondary-dark">
        {/* Image Slider */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary/20 hover:bg-primary/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary/20 hover:bg-primary/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentImageIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Caption */}
        <div className="absolute bottom-8 left-8 right-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">
              {images[currentImageIndex].title}
            </h3>
            <p className="text-white/90 text-sm">
              {images[currentImageIndex].subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};