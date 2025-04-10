import Icons from "../../assets/icons";

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
    subTabs: [
      {
        title: "Bookings List",
        route: "/dashboard/bookings-list",
        icon: Icons.ListChecks,
      },
      {
        title: "New Booking",
        route: "/dashboard/new-booking",
        icon: Icons.PlusCircle,
      },
    ],
  },
  {
    title: "Invoices",
    icon: Icons.FileText,
    route: "/dashboard/invoices-list",
    subTabs: [
      {
        title: "Invoices List",
        route: "/dashboard/invoices-list",
        icon: Icons.List,
      },
      {
        title: "New Invoice",
        route: "/dashboard/new-invoice",
        icon: Icons.FilePlus,
      },
      {
        title: "Edit Invoice",
        route: "/dashboard/edit-invoice",
        icon: Icons.SquarePen,
      },
    ],
  },
  {
    title: "Drivers",
    icon: Icons.Users,
    route: "/dashboard/driver-list",
    subTabs: [
      {
        title: "Driver List",
        route: "/dashboard/driver-list",
        icon: Icons.List,
      },
      {
        title: "New Driver",
        route: "/dashboard/new-driver",
        icon: Icons.UserPlus,
      },
      {
        title: "Registration Config",
        route: "/dashboard/driver-registration-config",
        icon: Icons.Settings2,
      },
    ],
  },
  {
    title: "Customers",
    icon: Icons.UsersRound,
    route: "/dashboard/customers-list",
    subTabs: [
      {
        title: "Customers List",
        route: "/dashboard/customers-list",
        icon: Icons.List,
      },
    ],
  },
  {
    title: "Statements",
    icon: Icons.FileText, 
    route: "/dashboard/driver-statements",
    subTabs: [
      {
        title: "Driver",
        route: "/dashboard/driver-statements",
        icon: Icons.Truck, 
      },
      {
        title: "Driver Payments",
        route: "/dashboard/driver-payments",
        icon: Icons.CreditCard, 
      },
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
  },
  {
    title: "Logout",
    icon: Icons.LogOut,
    route: "/dashboard/logout",
  },
];

export default sidebarItems;
