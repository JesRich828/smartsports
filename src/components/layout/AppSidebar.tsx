import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  BookOpen,
  Briefcase,
  BarChart3,
  Sparkles,
  BellRing,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Executive Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Grant Tracking", url: "/grants", icon: FileText },
  { title: "Donor & Prospect CRM", url: "/donors", icon: Users },
  { title: "Events", url: "/golf", icon: Flag },
  { title: "Programs", url: "/programs", icon: BookOpen },
  { title: "Board Dashboard", url: "/board", icon: Briefcase },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "AI Assistants", url: "/assistants", icon: Sparkles },
  { title: "Automations", url: "/automations", icon: BellRing },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? currentPath === "/" : currentPath.startsWith(url));
  const [logo, setLogo] = useState("");
  const [orgName, setOrgName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [showLogoTextFallback, setShowLogoTextFallback] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("organization_settings")
          .select("logo_initials, org_name, tagline, logo_url")
          .single();
        if (data && !error) {
          setLogo(data.logo_initials || "SS");
          setOrgName(data.org_name || "SMART Sports");
          setTagline(data.tagline || "Connecting sports, academics & leadership.");
          setLogoUrl(data.logo_url || "");
        } else {
          setLogo("SS");
          setOrgName("SMART Sports");
          setTagline("Connecting sports, academics & leadership.");
        }
      } catch {
        setLogo("SS");
        setOrgName("SMART Sports");
        setTagline("Connecting sports, academics & leadership.");
      }
    };
    fetchSettings();
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          {logoUrl ? (
            showLogoTextFallback ? (
              <>
                <div
                  className="h-9 w-9 shrink-0 rounded-lg bg-sidebar-foreground/95 bg-no-repeat shadow-sm"
                  style={{
                    backgroundImage: `url(${logoUrl})`,
                    backgroundPosition: "center 28%",
                    backgroundSize: "76px 76px",
                  }}
                  aria-hidden="true"
                />
                <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="font-display text-sm font-bold text-sidebar-foreground">{orgName}</span>
                  <span className="text-xs text-sidebar-foreground/60">FY26 Fundraising</span>
                </div>
              </>
            ) : (
              <>
                <img
                  src={logoUrl}
                  alt={orgName}
                  className="block h-auto w-full max-w-[180px] shrink-0 rounded-sm bg-sidebar-foreground/95 p-1.5 object-contain shadow-sm group-data-[collapsible=icon]:hidden"
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    if (image.naturalWidth > 0 && image.naturalHeight > 0 && image.naturalWidth / image.naturalHeight < 1.8) {
                      setShowLogoTextFallback(true);
                    }
                  }}
                  onError={() => setShowLogoTextFallback(true)}
                />
                <img
                  src={logoUrl}
                  alt={orgName}
                  className="hidden h-8 w-8 shrink-0 rounded-md bg-sidebar-foreground/95 p-1 object-contain shadow-sm group-data-[collapsible=icon]:block"
                />
              </>
            )
          ) : (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-display text-base font-extrabold text-sidebar-primary-foreground">
                {logo}
              </div>
              <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-display text-sm font-bold text-sidebar-foreground">{orgName}</span>
                <span className="text-xs text-sidebar-foreground/60">FY26 Fundraising</span>
              </div>
            </>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-2 py-1 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          {tagline}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}