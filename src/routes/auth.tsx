import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In — SMART Sports FY26 Fundraising" },
      { name: "description", content: "Secure sign in for the SMART Sports fundraising dashboard." },
    ],
  }),
  component: AuthPage,
});

const getAuthOrgSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("organization_settings")
    .select("org_name, logo_url, logo_initials")
    .single();

  if (error || !data) {
    return { orgName: "SMART Sports", logoUrl: "", logoInitials: "SS" };
  }
  return {
    orgName: data.org_name || "SMART Sports",
    logoUrl: data.logo_url || "",
    logoInitials: data.logo_initials || "SS",
  };
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("SMART Sports");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoInitials, setLogoInitials] = useState("SS");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const settings = await getAuthOrgSettings();
        if (isMounted) {
          setOrgName(settings.orgName || "SMART Sports");
          setLogoUrl(settings.logoUrl || "");
          setLogoInitials(settings.logoInitials || "SS");
        }
      } catch {
        if (isMounted) {
          setOrgName("SMART Sports");
          setLogoUrl("");
          setLogoInitials("SS");
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.title.includes("SMART Sports")) {
      document.title = document.title.replace(/SMART Sports/g, orgName);
    }
    document.querySelectorAll("meta").forEach((m) => {
      const c = m.getAttribute("content");
      if (c && c.includes("SMART Sports")) {
        m.setAttribute("content", c.replace(/SMART Sports/g, orgName));
      }
    });
  }, [orgName]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const normalizedEmail = email.trim().toLowerCase();
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/auth" className="mb-6 flex items-center justify-center gap-3">
          <div className="grid leading-tight">
            <span className="font-display text-lg font-bold text-foreground">{orgName}</span>
            <span className="text-xs text-muted-foreground">FY26 Fundraising Command Center</span>
          </div>
        </Link>

        <Card className="p-6">
          <div className="mb-4 flex justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={orgName}
                className="h-24 w-auto max-w-full object-contain"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary font-display text-3xl font-extrabold text-primary-foreground">
                {logoInitials}
              </div>
            )}
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Register to access the fundraising dashboard."
              : "Sign in to access the fundraising dashboard."}
          </p>

          <form onSubmit={handleEmail} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "signup" ? "Sign up" : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode((m) => (m === "signup" ? "signin" : "signup"));
                setPassword("");
              }}
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleGoogle} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.19 3.33v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.11z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.98.66-2.23 1.06-3.73 1.06-2.87 0-5.3-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </Card>
      </div>
    </div>
  );
}
