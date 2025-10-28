import * as React from "react";
import {
  ChefHat,
  Command,
  LandPlot,
  ListOrdered,
  SquareMenu,
  Table,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "  User Management",
      url: "/admin/users",
      icon: Users,
      isActive: true,
    },
    {
      title: "Menu Management",
      url: "/admin/menus",
      icon: SquareMenu,
    },
    {
      title: "Table Management",
      url: "/admin/tables",
      icon: Table,
    },
    {
      title: "Product Management",
      url: "/admin/products",
      icon: ChefHat,
    },
    {
      title: "Reservation Management",
      url: "/admin/reservations",
      icon: LandPlot,
    },
    {
      title: "Order Management",
      url: "/admin/orders",
      icon: ListOrdered,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems = data.navMain.map((item) => ({
    ...item,
    isActive: location.pathname === item.url,
  }));
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Coffee shop</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
