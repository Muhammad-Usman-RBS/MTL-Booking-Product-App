import Icons from "../../assets/icons";

const sidebarItems = [
  {
    title: "Home",
    icon: Icons.Home,
    route: "/dashboard/home",
  },
  {
    title: "Bookings",
    icon: Icons.ScrollText,
    route: "/dashboard/bookings",
    subTabs: [
      {
        title: "Bookings List",
        route: "/dashboard/bookings/list",
        icon: Icons.ListChecks,
      },
      {
        title: "New Booking",
        route: "/dashboard/bookings/new",
        icon: Icons.PlusCircle,
      },
    ],
  },
  {
    title: "Invoices",
    icon: Icons.FileText,
    route: "/dashboard/invoices",
    subTabs: [
      {
        title: "Invoices List",
        route: "/dashboard/invoices/list",
        icon: Icons.List,
      },
      {
        title: "New Invoice",
        route: "/dashboard/invoices/new",
        icon: Icons.FilePlus,
      },
      {
        title: "Edit Invoice",
        route: "/dashboard/invoices/edit",
        icon: Icons.SquarePen,
      },
    ],
  },
  {
    title: "Drivers",
    icon: Icons.Users,
    route: "/dashboard/drivers",
    subTabs: [
      {
        title: "Driver List",
        route: "/dashboard/drivers/list",
        icon: Icons.List,
      },
      {
        title: "New Driver",
        route: "/dashboard/drivers/new",
        icon: Icons.UserPlus,
      },
      // {
      //   title: "Registration Config",
      //   route: "/dashboard/drivers/config",
      //   icon: Icons.Settings2,
      // },
      {
        title: "Rides",
        icon: Icons.CarFront,
        route: "/dashboard/drivers/all-rides",
        // roles: ["clientadmin"],
      },
      {
        title: "Earnings",
        icon: Icons.Activity,
        route: "/dashboard/drivers/earnings",
        // roles: ["clientadmin"],
      },
    ],
  },
  {
    title: "Customers",
    icon: Icons.UsersRound,
    route: "/dashboard/customers",
    subTabs: [
      {
        title: "Customers List",
        route: "/dashboard/customers/list",
        icon: Icons.List,
      },
    ],
  },
  {
    title: "Company Accounts",
    icon: Icons.Building,
    route: "/dashboard/company-accounts",
    subTabs: [
      {
        title: "Accounts List",
        route: "/dashboard/company-accounts/list",
        icon: Icons.FileText,
      },
      {
        title: "Add Account",
        route: "/dashboard/company-accounts/new",
        icon: Icons.PlusCircle,
      },
    ],
  },
  {
    title: "Statements",
    icon: Icons.FileText,
    route: "/dashboard/statements",
    subTabs: [
      {
        title: "Driver Statements",
        route: "/dashboard/statements/driver",
        icon: Icons.Truck,
      },
      {
        title: "Driver Payments",
        route: "/dashboard/statements/payments",
        icon: Icons.CreditCard,
      },
    ],
  },
  {
    title: "Users",
    icon: Icons.Users,
    route: "/dashboard/admin-list",
  },
  {
    title: "Pricing",
    icon: Icons.DollarSign,
    route: "/dashboard/pricing",
    subTabs: [
      {
        title: "General",
        route: "/dashboard/pricing/general",
        icon: Icons.Settings,
      },
      {
        title: "Vehicle Pricing",
        route: "/dashboard/pricing/vehicle",
        icon: Icons.Truck,
      },
      {
        title: "Distance Slab",
        route: "/dashboard/pricing/distance-slab",
        icon: Icons.Activity,
      },
      {
        title: "Hourly Packages",
        route: "/dashboard/pricing/hourly-packages",
        icon: Icons.Clock,
      },
      {
        title: "Fixed Pricing",
        route: "/dashboard/pricing/fixed",
        icon: Icons.Tag,
      },
      {
        title: "Postcode District",
        route: "/dashboard/pricing/postcode-district",
        icon: Icons.Map,
      },
      {
        title: "Discounts / Surcharge - Date",
        route: "/dashboard/pricing/discounts-date",
        icon: Icons.Calendar,
      },
      {
        title: "Vouchers",
        route: "/dashboard/pricing/vouchers",
        icon: Icons.Gift,
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
        icon: Icons.Sliders,
      },
      {
        title: "Booking",
        route: "/dashboard/settings/booking",
        icon: Icons.Book,
      },
      { title: "Email", route: "/dashboard/settings/email", icon: Icons.Mail },
      {
        title: "Location Category",
        route: "/dashboard/settings/location-category",
        icon: Icons.MapPin,
      },
      {
        title: "Locations",
        route: "/dashboard/settings/locations",
        icon: Icons.Map,
      },
      { title: "Zones", route: "/dashboard/settings/zones", icon: Icons.Grid },
      {
        title: "Coverage",
        route: "/dashboard/settings/coverage",
        icon: Icons.Globe,
      },
      {
        title: "Payment Options",
        route: "/dashboard/settings/payment-options",
        icon: Icons.CreditCard,
      },
      {
        title: "Booking Restriction Date",
        route: "/dashboard/settings/booking-restriction-date",
        icon: Icons.CalendarX,
      },
      {
        title: "Review",
        route: "/dashboard/settings/review",
        icon: Icons.Star,
      },
      {
        title: "Receipt",
        route: "/dashboard/settings/receipt",
        icon: Icons.Receipt,
      },
      {
        title: "Notifications",
        route: "/dashboard/settings/notifications",
        icon: Icons.Bell,
      },
      {
        title: "Google Calendar",
        route: "/dashboard/settings/google-calendar",
        icon: Icons.Calendar,
      },
      {
        title: "SMS",
        route: "/dashboard/settings/sms",
        icon: Icons.MessageSquare,
      },
      {
        title: "Social Media",
        route: "/dashboard/settings/social-media",
        icon: Icons.Share2,
      },
      {
        title: "Chat Plugin",
        route: "/dashboard/settings/chat-plugin",
        icon: Icons.MessageCircle,
      },
      {
        title: "Cron Job",
        route: "/dashboard/settings/cron-job",
        icon: Icons.Clock,
      },
      {
        title: "Driver Contact",
        route: "/dashboard/settings/driver-contact",
        icon: Icons.Clock,
      },
      {
        title: "Terms and Condition",
        route: "/dashboard/settings/terms-and-condition",
        icon: Icons.Clock,
      },
    ],
  },
  {
    title: "Widget/API",
    icon: Icons.Code,
    route: "/dashboard/widget-api",
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

