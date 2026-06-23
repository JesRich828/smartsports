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

const getAuthOrgName = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("organization_settings")
    .select("org_name")
    .single();

  if (error || !data?.org_name) return "SMART Sports";
  return data.org_name;
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("SMART Sports");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchOrgName = async () => {
      try {
        const name = await getAuthOrgName();
        if (isMounted) setOrgName(name || "SMART Sports");
      } catch {
        if (isMounted) setOrgName("SMART Sports");
      }
    };

    fetchOrgName();

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/" });
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
        extraParams: {
          hd: "smartsports.org",
        },
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
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
            SS
          </div>
          <div className="grid leading-tight">
            <span className="font-display text-lg font-bold text-foreground">{orgName}</span>
            <span className="text-xs text-muted-foreground">FY26 Fundraising Command Center</span>
          </div>
        </Link>

        <Card className="p-6">
          <h1 className="font-display text-xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access the fundraising dashboard.
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
                placeholder="you@smartsports.org"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Sign in
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access is invite-only. Contact an administrator to request an account.
          </p>
        </Card>
      </div>
    </div>
  );
}
