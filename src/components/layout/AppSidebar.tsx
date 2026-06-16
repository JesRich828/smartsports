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
  { title: "Golf Invitational", url: "/golf", icon: Flag },
  { title: "Programs", url: "/programs", icon: BookOpen },
  { title: "Board Dashboard", url: "/board", icon: Briefcase },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "AI Assistants", url: "/assistants", icon: Sparkles },
  { title: "Automations", url: "/automations", icon: BellRing },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? currentPath === "/" : currentPath.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-display text-base font-extrabold text-sidebar-primary-foreground">
            SS
          </div>
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-bold text-sidebar-foreground">SMART Sports</span>
            <span className="text-xs text-sidebar-foreground/60">FY26 Fundraising</span>
          </div>
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
          Connecting sports, academics & leadership.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}