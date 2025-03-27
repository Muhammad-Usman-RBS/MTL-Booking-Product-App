import Icons from "../assets/icons";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Icons.LayoutDashboard,
    route: "/dashboard",
    subTabs: [
      { title: "Sub Tab 1", route: "/dashboard/sub1", icon: Icons.Wrench },
      { title: "Sub Tab 2", route: "/dashboard/sub2", icon: Icons.Shield },
    ],
  },
  {
    title: "Settings",
    icon: Icons.Settings,
    route: "/dashboard/settings",
    subTabs: [
      {
        title: "General",
        route: "/dashboard/settings/general",
        icon: Icons.Wrench,
      },
      {
        title: "Security",
        route: "/dashboard/settings/security",
        icon: Icons.Shield,
      },
    ],
  },
  {
    title: "Profile",
    icon: Icons.User,
    route: "/dashboard/profile",
    subTabs: [
      {
        title: "Edit Profile",
        route: "/dashboard/profile/edit",
        icon: Icons.Edit,
      },
      {
        title: "Account Settings",
        route: "/dashboard/profile/account",
        icon: Icons.UserCog,
      },
    ],
  },
  {
    title: "Logout",
    icon: Icons.LogOut,
    route: "/dashboard/logout",
  },
];

export default sidebarItems;
