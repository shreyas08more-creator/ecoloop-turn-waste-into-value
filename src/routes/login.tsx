import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  Recycle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "EcoLoop — Login / Sign Up" },
      {
        name: "description",
        content: "Sign in or create an account to start recycling smarter with EcoLoop.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage("Account created! Please check your email to verify your account.");
          setIsSignUp(false);
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate({ to: "/" });
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondary/6 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo & header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-eco eco-glow">
              <Leaf className="h-6 w-6 text-black" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold tracking-tight">EcoLoop</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">Turn Waste Into Value</div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp
              ? "Join the circular economy revolution"
              : "Sign in to continue recycling smarter"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl sm:p-8">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium transition hover:bg-background hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (sign up only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Success message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-primary"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-eco py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle sign up / sign in */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-primary transition hover:text-primary/80"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-primary transition hover:text-primary/80"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Recycle, label: "Sell Waste" },
            { icon: Sparkles, label: "AI Scanner" },
            { icon: Leaf, label: "Earn Rewards" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-surface/40 py-3 text-center"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
          By continuing, you agree to EcoLoop&apos;s{" "}
          <span className="underline cursor-pointer">Terms of Service</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}
