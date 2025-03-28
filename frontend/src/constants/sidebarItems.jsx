import Icons from "../assets/icons";

const sidebarItems = [
  {
    title: "Home",
    icon: Icons.Home,
    route: "/dashboard",
    // subTabs: [
    //   { title: "Sub Tab 1", route: "/dashboard/sub1", icon: Icons.Wrench },
    //   { title: "Sub Tab 2", route: "/dashboard/sub2", icon: Icons.Shield },
    // ],
  },
  {
    title: "Bookings",
    icon: Icons.ScrollText,
    route: "/dashboard/bookings-list",
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
  },
  {
    title: "Logout",
    icon: Icons.LogOut,
    route: "/dashboard/logout",
  },
];

export default sidebarItems;
