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
    roles: [
      "demo",
      "driver",
      "customer",
      "clientadmin",
      "associateadmin",
      "staffmember",
    ],
    subTabs: [
      {
        title: "Bookings List",
        route: "/dashboard/bookings/list",
        icon: Icons.ListChecks,
        roles: ["demo", "clientadmin", "customer", "associateadmin", "staffmember"],
      },
      {
        title: "New Booking",
        route: "/dashboard/bookings/new",
        icon: Icons.PlusCircle,
        roles: ["demo", "clientadmin", "customer", "associateadmin", "staffmember"],
      },
      {
        title: "Booking Calendar",
        route: "/dashboard/bookings/calendar",
        icon: Icons.CalendarDays,
        roles: ["demo", "clientadmin", "associateadmin", "driver", "customer", "staffmember"],
      },
    ],
  },
  {
    title: "Invoices",
    icon: Icons.FileText,
    route: "/dashboard/invoices",
    roles: [
      "demo",
      "driver",
      "customer",
      "clientadmin",
      "associateadmin",
      "staffmember"
    ],
    subTabs: [
      {
        title: "Invoices List",
        route: "/dashboard/invoices/list",
        icon: Icons.List,
        roles: [
          "demo",
          "driver",
          "superadmin",
          "staffmember",
          "associateadmin",
          "customer",
          "clientadmin",
        ],
      },
      {
        title: "New Driver Invoice",
        route: "/dashboard/invoices/driver/new",
        icon: Icons.FilePlus,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "New Customer Invoice",
        route: "/dashboard/invoices/customer/new",
        icon: Icons.FilePlus,
        roles: ["demo", "clientadmin", "superadmin", "associateadmin", "staffmember"],
      },
    ],
  },
  {
    title: "Drivers",
    icon: Icons.Users,
    route: "/dashboard/drivers",
    roles: [
      "demo",
      "driver",
      "customer",
      "clientadmin",
      "associateadmin",
      "staffmember"
    ],
    subTabs: [
      {
        title: "Driver List",
        route: "/dashboard/drivers/list",
        icon: Icons.List,
        roles: [
          "demo",
          "driver",
          "superadmin",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
      {
        title: "New Driver",
        route: "/dashboard/drivers/new",
        icon: Icons.UserPlus,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
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
        roles: ["demo", "driver", "superadmin",],
      },
      {
        title: "Earnings",
        icon: Icons.Activity,
        route: "/dashboard/drivers/earnings",
        roles: ["demo", "driver", "superadmin",],
      },
    ],
  },
  {
    title: "Customers",
    icon: Icons.UsersRound,
    route: "/dashboard/customers",
    roles: [
      "demo",
      "driver",
      "customer",
      "clientadmin",
      "associateadmin",
      "staffmember"
    ],
    subTabs: [
      {
        title: "Customers List",
        route: "/dashboard/customers/list",
        icon: Icons.List,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
    ],
  },
  // {
  //   title: "Statements",
  //   icon: Icons.FileText,
  //   route: "/dashboard/statements",
  //   subTabs: [
  //     {
  //       title: "Driver Statements",
  //       route: "/dashboard/statements/driver",
  //       icon: Icons.Truck,
  //       roles: [
  //         "driver",
  //         "superadmin",
  //         "clientadmin",
  //         "associateadmin",
  //         
  //       ],
  //     },
  //     {
  //       title: "Driver Payments",
  //       route: "/dashboard/statements/payments",
  //       icon: Icons.CreditCard,
  //       roles: [
  //         "driver",
  //         "superadmin",
  //         "clientadmin",
  //         "associateadmin",
  //         
  //         "driver",
  //       ],
  //     },
  //   ],
  // },
  {
    title: "Users",
    icon: Icons.Users,
    route: "/dashboard/admin-list",
    subTabs: [
      {
        title: "Admin List",
        icon: Icons.List,
        route: "/dashboard/admin-list",
        roles: ["demo", "superadmin", "clientadmin", "associateadmin", "staffmember"],
      },
      {
        title: "New  User",
        icon: Icons.User,
        route: "/dashboard/admin-list/add-user",
        roles: ["demo", "superadmin", "clientadmin", "associateadmin", "staffmember"],
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
        roles: ["demo", "superadmin", "clientadmin", "staffmember"],
      },
      {
        title: "Add Account",
        route: "/dashboard/company-accounts/new",
        icon: Icons.PlusCircle,
        roles: ["demo", "superadmin", "clientadmin", "staffmember"],
      },
      {
        title: "View Company",
        route: "/dashboard/view-company",
        icon: Icons.Building2,
        roles: [
          "demo",
          "driver",
          "customer",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
    ],
  },
  {
    title: "Pricing",
    icon: Icons.DollarSign,
    route: "/dashboard/pricing",
    roles: [
      "demo",
      "driver",
      "customer",
      "clientadmin",
      "associateadmin",
      "staffmember"
    ],
    subTabs: [
      {
        title: "General",
        route: "/dashboard/pricing/general",
        icon: Icons.Settings,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Vehicle Pricing",
        route: "/dashboard/pricing/vehicle",
        icon: Icons.Truck,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Distance Slab",
        route: "/dashboard/pricing/distance-slab",
        icon: Icons.Activity,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Hourly Packages",
        route: "/dashboard/pricing/hourly-packages",
        icon: Icons.Clock,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Fixed Pricing",
        route: "/dashboard/pricing/fixed",
        icon: Icons.Tag,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Postcode District",
        route: "/dashboard/pricing/postcode-district",
        icon: Icons.Map,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember",],
      },
      {
        title: "Zones",
        route: "/dashboard/pricing/zones",
        icon: Icons.Grid,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Discounts / Surcharge - Date",
        route: "/dashboard/pricing/discounts-date",
        icon: Icons.Calendar,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
      },
      {
        title: "Vouchers",
        route: "/dashboard/pricing/vouchers",
        icon: Icons.Gift,
        roles: ["demo", "clientadmin", "associateadmin", "superadmin", "staffmember"],
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
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "superadmin",
          "staffmember"
        ],
      },

      {
        title: "Booking",
        route: "/dashboard/settings/booking",
        icon: Icons.Book,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
      // {
      //   title: "Email",
      //   route: "/dashboard/settings/email",
      //   icon: Icons.Mail,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      // {
      //   title: "Location Category",
      //   route: "/dashboard/settings/location-category",
      //   icon: Icons.MapPin,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      {
        title: "Notifications",
        route: "/dashboard/settings/notifications",
        icon: Icons.Bell,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "driver",
          "staffmember"
        ],
      },
      // {
      //   title: "Locations",
      //   route: "/dashboard/settings/locations",
      //   icon: Icons.Map,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      {
        title: "Coverage",
        route: "/dashboard/settings/coverage",
        icon: Icons.Globe,
        roles: [
          "demo",
          "clientadmin",
          "staffmember",
          "associateadmin",
        ],
      },
      {
        title: "Payment Options",
        route: "/dashboard/settings/payment-options",
        icon: Icons.CreditCard,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
      {
        title: "Booking Restriction Date",
        route: "/dashboard/settings/booking-restriction-date",
        icon: Icons.CalendarX,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
      {
        title: "Review",
        route: "/dashboard/settings/review",
        icon: Icons.Star,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
      // {
      //   title: "Receipt",
      //   route: "/dashboard/settings/receipt",
      //   icon: Icons.Receipt,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      // {
      //   title: "Notifications Settings",
      //   route: "/dashboard/settings/settings-notifications",
      //   icon: Icons.Bell,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      // {
      //   title: "Google Calendar",
      //   route: "/dashboard/settings/google-calendar",
      //   icon: Icons.Calendar,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      // {
      //   title: "SMS",
      //   route: "/dashboard/settings/sms",
      //   icon: Icons.MessageSquare,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      // {
      //   title: "Social Media",
      //   route: "/dashboard/settings/social-media",
      //   icon: Icons.Share2,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      // {
      //   title: "Chat Plugin",
      //   route: "/dashboard/settings/chat-plugin",
      //   icon: Icons.MessageCircle,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      {
        title: "Cron Job",
        route: "/dashboard/settings/cron-job",
        icon: Icons.Clock,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "staffmember"
        ],
      },
      // {
      //   title: "Driver Contact",
      //   route: "/dashboard/settings/driver-contact",
      //   icon: Icons.Phone,
      //   roles: [
      //     "clientadmin",
      //     "associateadmin",
      //     "superadmin",
      //     
      //     "driver",
      //   ],
      // },
      {
        title: "Terms and Condition",
        route: "/dashboard/settings/terms-and-condition",
        icon: Icons.ScrollText,
        roles: [
          "demo",
          "clientadmin",
          "associateadmin",
          "superadmin",
          "staffmember",
          "driver",
          "customer"
        ],
      },
    ],
  },
  {
    title: "Widget/API",
    icon: Icons.Code,
    route: "/dashboard/widget-api",
    roles: [
      "demo",
      "clientadmin",
      "associateadmin",
      "staffmember",
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
