// src/pages/Login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ReactSVG from '../assets/react.svg';
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការចូលប្រើប្រាស់។ សូមពិនិត្យអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នកម្តងទៀត។");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-100 overflow-hidden relative">
      {/* Floating SVGs */}
      <img src={ReactSVG} alt="floating" className="absolute left-10 top-10 w-16 animate-float-slow opacity-60 pointer-events-none" />
      <img src={ReactSVG} alt="floating" className="absolute right-10 top-32 w-12 animate-float-medium opacity-40 pointer-events-none" />
      <img src={ReactSVG} alt="floating" className="absolute left-1/4 bottom-10 w-20 animate-float-fast opacity-30 pointer-events-none" />
      {/* Floating Emojis */}
      <span className="absolute left-1/3 top-20 text-4xl animate-float-slow2 pointer-events-none select-none">🍷</span>
      <span className="absolute right-1/4 top-1/4 text-3xl animate-float-medium2 pointer-events-none select-none">💍</span>
      <span className="absolute left-16 bottom-24 text-4xl animate-float-fast2 pointer-events-none select-none">💐</span>
      <span className="absolute right-20 bottom-16 text-4xl animate-float-slow3 pointer-events-none select-none">🎉</span>
      
      <div className="bg-white/90 shadow-xl rounded-2xl p-8 max-w-md w-full border border-purple-200 relative z-10">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full shadow-md border-4 border-white">
          <span className="text-3xl">💍</span>
        </div>
        <h1 className="text-2xl font-extrabold text-purple-700 text-center mt-10 mb-2 tracking-wide">Welcome to the Wedding Portal</h1>
        <p className="text-center text-gray-500 mb-6">Sign in to manage your special day</p>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-purple-700">Email</Label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-purple-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                កំពុងចូល...
              </div>
            ) : "ចូលប្រើប្រាស់"}
          </Button>
        </form>
      </div>
      {/* Floating SVG Animations */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
          100% { transform: translateY(0); }
        }
        @keyframes float-medium {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        @keyframes float-fast {
          0% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
          100% { transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3.5s ease-in-out infinite; }
        /* Extra emoji float animations */
        @keyframes float-slow2 {
          0% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-35px) rotate(10deg); }
          100% { transform: translateY(0) rotate(-5deg); }
        }
        @keyframes float-medium2 {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-25px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes float-fast2 {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-45px) rotate(15deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes float-slow3 {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.15); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-float-slow2 { animation: float-slow2 8s ease-in-out infinite; }
        .animate-float-medium2 { animation: float-medium2 6s ease-in-out infinite; }
        .animate-float-fast2 { animation: float-fast2 4s ease-in-out infinite; }
        .animate-float-slow3 { animation: float-slow3 9s ease-in-out infinite; }
      `}</style>
    </div>
  );
}