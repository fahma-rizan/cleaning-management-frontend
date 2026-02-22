import { Link } from 'react-router';
import { CheckCircle2, ArrowRight, Home, Sparkles } from 'lucide-react';

export default function VerificationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center animate-in zoom-in-95 duration-300">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4">Verified Successfully!</h1>
        <p className="text-gray-600 mb-10 leading-relaxed">
          Your account has been verified. You can now access all features of CLOUD LAUNDRY.LK and start booking your services.
        </p>

        <div className="space-y-4">
          <Link 
            to="/dashboard" 
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 group"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            to="/" 
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-purple-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Welcome to the family</span>
        </div>
      </div>
    </div>
  );
}
