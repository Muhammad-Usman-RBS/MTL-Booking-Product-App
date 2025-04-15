import IMAGES from "../../assets/images";

export const statusList = [
  { label: "Scheduled", count: 41 },
  { label: "Pending", count: 0 },
  { label: "Payment Pending", count: 20 },
  { label: "No Show", count: 177 },
  { label: "Completed", count: 7389 },
  { label: "Cancelled", count: 193 },
  { label: "Rejected", count: 0 },
  { label: "Deleted", count: 0 },
  { label: "All", count: 7820 },
];

export const itemsPerPageOptions = [1, 2, 3, 40, "All"];

export const sampleData = [
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "\u00a3195",
    drFare: "\u00a30",
    driver: "No Driver",
    statusAudit: [
      {
        updatedBy: "Hafiz Amir",
        status: "Assigned to Driver",
        date: "18-08-2024 11:25",
      },
      { updatedBy: "Jeremy", status: "Accepted", date: "18-08-2024 11:28" },
      { updatedBy: "Khizer", status: "On Route", date: "18-08-2024 11:58" },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Emily Watson",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Heathrow Terminal 2",
    vehicle: "Executive Sedan",
    payment: "Cash",
    fare: "\u00a3170",
    drFare: "\u00a320",
    driver: "ALI",
    statusAudit: [
      { updatedBy: "Admin", status: "Assigned", date: "19-08-2024 10:00" },
      { updatedBy: "Emily", status: "Accepted", date: "19-08-2024 10:15" },
    ],
  },
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "\u00a3195",
    drFare: "\u00a30",
    driver: "No Driver",
    statusAudit: [
      {
        updatedBy: "Hafiz Amir",
        status: "Assigned to Driver",
        date: "18-08-2024 11:25",
      },
      { updatedBy: "Jeremy", status: "Accepted", date: "18-08-2024 11:28" },
      { updatedBy: "Khizer", status: "On Route", date: "18-08-2024 11:58" },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Emily Watson",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Heathrow Terminal 2",
    vehicle: "Executive Sedan",
    payment: "Cash",
    fare: "\u00a3170",
    drFare: "\u00a320",
    driver: "ALI",
    statusAudit: [
      { updatedBy: "Admin", status: "Assigned", date: "19-08-2024 10:00" },
      { updatedBy: "Emily", status: "Accepted", date: "19-08-2024 10:15" },
    ],
  },
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "\u00a3195",
    drFare: "\u00a30",
    driver: "Ahmad",
    statusAudit: [
      {
        updatedBy: "System",
        status: "Auto Assigned",
        date: "18-08-2024 09:00",
      },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Emily Watson",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Heathrow Terminal 2",
    vehicle: "Executive Sedan",
    payment: "Cash",
    fare: "\u00a314530",
    drFare: "\u00a320",
    driver: "Noman",
    statusAudit: [
      {
        updatedBy: "Emily",
        status: "Payment Confirmed",
        date: "19-08-2024 10:30",
      },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Omar Farooq",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Saeed",
    vehicle: "Nasir",
    payment: "Usman",
    fare: "\u00a3170",
    drFare: "\u00a320",
    driver: "Usmna",
    statusAudit: [
      { updatedBy: "Usman", status: "Scheduled", date: "20-08-2024 13:00" },
      {
        updatedBy: "Omar Farooq",
        status: "Completed",
        date: "20-08-2024 14:00",
      },
    ],
  },
];

export const options = [
  "Accepted",
  "On Route",
  "At Location",
  "Ride Started",
  "No Show",
  "Completed",
];

export const actionMenuItems = [
  "View",
  "Edit",
  "Cancel",
  "Delete",
  "Status Audit",
];

export const driverList = [
  { label: "Usman Ahmed" },
  { label: "Khizer Khan" },
  { label: "Hafiz Amir" },
  { label: "Noman" },
  { label: "Zain Ul Abideen" },
];

export const passengerList = [
  { label: "Jeremy Haywood" },
  { label: "Emily Watson" },
  { label: "Omar Farooq" },
  { label: "Sarah Malik" },
  { label: "Daniel James" },
];

export const vehicleList = [
  { label: "Luxury MPV" },
  { label: "Executive Sedan" },
  { label: "Economy" },
  { label: "SUV" },
  { label: "All" },
];

export const accountList = [
  { label: "Corporate Account" },
  { label: "Personal Account" },
  { label: "Travel Agent" },
  { label: "Staff Booking" },
  { label: "Walk-in" },
];

export const customersData = [
  {
    name: "Muhammad Usman",
    email: "usman@example.com",
    contact: "+923001234567",
    status: "Active",
    createdDate: "28-03-2025 22:29",
    lastLogin: "28-03-2025 22:29",
    profile: IMAGES.profileimg,
    address: "Office #5, Blue Area, Islamabad",
    homeAddress: "Street 12, G-10/2, Islamabad",
  },
  {
    name: "Sarah Khan",
    email: "sarah.khan@example.com",
    contact: "+923331112222",
    status: "Active",
    createdDate: "24-03-2025 14:12",
    lastLogin: "27-03-2025 19:00",
    profile: IMAGES.profileimg,
    address: "Tech Hub, Main Boulevard, Lahore",
    homeAddress: "House 22, DHA Phase 4, Lahore",
  },
  {
    name: "Adeel Ahmad",
    email: "adeel.ahmad@example.com",
    contact: "+923004445555",
    status: "Suspended",
    createdDate: "15-03-2025 10:05",
    lastLogin: "22-03-2025 11:20",
    profile: IMAGES.profileimg,
    address: "Ground Floor, Software Park, Peshawar",
    homeAddress: "Flat #9, Gulbahar, Peshawar",
  },
  {
    name: "Maria Zafar",
    email: "maria.zafar@example.com",
    contact: "+923214567890",
    status: "Pending",
    createdDate: "18-03-2025 18:30",
    lastLogin: "19-03-2025 08:45",
    profile: IMAGES.profileimg,
    address: "Suite 2B, Business Bay, Karachi",
    homeAddress: "Plot 45, North Nazimabad, Karachi",
  },
  {
    name: "Hamza Tariq",
    email: "hamza.tariq@example.com",
    contact: "+923445566778",
    status: "Deleted",
    createdDate: "10-03-2025 09:00",
    lastLogin: "12-03-2025 14:00",
    profile: IMAGES.profileimg,
    address: "IT Tower, Mall Road, Lahore",
    homeAddress: "House #80, Johar Town, Lahore",
  },
  {
    name: "Fatima Sheikh",
    email: "fatima.sheikh@example.com",
    contact: "+923007776666",
    status: "Active",
    createdDate: "21-03-2025 20:45",
    lastLogin: "28-03-2025 21:20",
    profile: IMAGES.profileimg,
    address: "Digital Valley, F-11 Markaz, Islamabad",
    homeAddress: "Street 18, I-8/3, Islamabad",
  },
  {
    name: "Ali Raza",
    email: "ali.raza@example.com",
    contact: "+923217773344",
    status: "Delete Pending",
    createdDate: "12-03-2025 11:11",
    lastLogin: "15-03-2025 10:10",
    profile: IMAGES.profileimg,
    address: "Level 3, Tech Tower, Multan",
    homeAddress: "Block C, Gulgasht Colony, Multan",
  },
];

export const driversData = [
  {
    no: "104",
    name: "Abbas",
    email: "Jeffery786@hotmail.com",
    make: "Mercedes Benz",
    model: "E Class",
    regNo: "GV68WSZ",
    documents: "Expired",
    status: "Suspended",
    driverImage: IMAGES.profileimg,
    vehicleImage: IMAGES.mercedesVito,
    shortName: "SC",
    address: "123 Road",
    contact: "1234567890",
    dob: "1990-01-01",
    nationality: "British",
    drivingLicense: "DL12345",
    licenseExpiry: "2025-12-01",
    taxiLicense: "TXL7890",
    taxiLicenseExpiry: "2024-10-15",
    pcoCard: "PCO-567",
    pcoExpiry: "2024-07-01",
    niNumber: "NI999999A",
    insurance: "Aviva",
    insuranceExpiry: "2025-01-01",
    vehicleTaxiLicense: "TX999",
    vehicleTaxiExpiry: "2024-12-31",
    condition: "Excellent",
    conditionExpiry: "2024-11-01",
    carV5: "Available",
    vehicleTypes: ["Standard Saloon", "Luxury MPV"],
  },
];

export const invoicesData = [
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    status: "Paid",
    email: "erin.leahy@example.com",
    phone: "+447930844247",
    rides: [
      {
        number: "2212323",
        passenger: "Erin Leahy",
        pickup: "London Stansted Airport (STN)",
        drop: "32 The Bishops Ave, London N2 0BA, UK",
        datetime: "23-12-2022 14:05",
        amount: "92.00",
        tax: "0%",
      },
    ],
    subtotal: "92.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "92.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00002",
    customer: "Peter Griffiths",
    account: "Account 2",
    date: "05-01-2023",
    dueDate: "12-01-2023",
    amount: "110.00",
    status: "Unpaid",
    email: "peter.griffiths@example.com",
    phone: "+447955123456",
    rides: [
      {
        number: "2212649",
        passenger: "Peter Griffiths",
        pickup: "Tring Station Car Park, Hertfordshire",
        drop: "London Coliseum, St Martin",
        datetime: "27-12-2022 11:00",
        amount: "110.00",
        tax: "0%",
      },
    ],
    subtotal: "110.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "110.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    status: "Paid",
    email: "erin.leahy@example.com",
    phone: "+447930844247",
    rides: [
      {
        number: "2212323",
        passenger: "Erin Leahy",
        pickup: "London Stansted Airport (STN)",
        drop: "32 The Bishops Ave, London N2 0BA, UK",
        datetime: "23-12-2022 14:05",
        amount: "92.00",
        tax: "0%",
      },
    ],
    subtotal: "92.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "92.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00002",
    customer: "Peter Griffiths",
    account: "Account 2",
    date: "05-01-2023",
    dueDate: "12-01-2023",
    amount: "110.00",
    status: "Unpaid",
    email: "peter.griffiths@example.com",
    phone: "+447955123456",
    rides: [
      {
        number: "2212649",
        passenger: "Peter Griffiths",
        pickup: "Tring Station Car Park, Hertfordshire",
        drop: "London Coliseum, St Martin",
        datetime: "27-12-2022 11:00",
        amount: "110.00",
        tax: "0%",
      },
    ],
    subtotal: "110.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "110.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    status: "Paid",
    email: "erin.leahy@example.com",
    phone: "+447930844247",
    rides: [
      {
        number: "2212323",
        passenger: "Erin Leahy",
        pickup: "London Stansted Airport (STN)",
        drop: "32 The Bishops Ave, London N2 0BA, UK",
        datetime: "23-12-2022 14:05",
        amount: "92.00",
        tax: "0%",
      },
    ],
    subtotal: "92.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "92.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00002",
    customer: "Peter Griffiths",
    account: "Account 2",
    date: "05-01-2023",
    dueDate: "12-01-2023",
    amount: "110.00",
    status: "Unpaid",
    email: "peter.griffiths@example.com",
    phone: "+447955123456",
    rides: [
      {
        number: "2212649",
        passenger: "Peter Griffiths",
        pickup: "Tring Station Car Park, Hertfordshire",
        drop: "London Coliseum, St Martin",
        datetime: "27-12-2022 11:00",
        amount: "110.00",
        tax: "0%",
      },
    ],
    subtotal: "110.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "110.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
];

export const statementsData = [
  {
    driver: "0233 Hassan Butt",
    email: "hassanbutt@example.com",
    period: "03-03-2025 to 09-03-2025",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "96.00 GBP",
    due: "96.00 GBP",
    paid: "96.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "1 Usman",
    email: "usman@example.com",
    period: "21-10-2024 to 27-10-2024",
    bookings: 6,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "1297.00 GBP",
    due: "1297.00 GBP",
    paid: "1297.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "10 Aftab Khan",
    email: "aftabkhan@example.com",
    period: "13-05-2024 to 19-05-2024",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "190.00 GBP",
    due: "190.00 GBP",
    paid: "190.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "104 Abbas",
    email: "abbas@example.com",
    period: "17-07-2023 to 23-07-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "146.00 GBP",
    due: "146.00 GBP",
    paid: "146.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "105 Raj Bagga",
    email: "rajbagga@example.com",
    period: "29-05-2023 to 04-06-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "126.00 GBP",
    due: "126.00 GBP",
    paid: "126.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "0233 Hassan Butt",
    email: "hassanbutt@example.com",
    period: "03-03-2025 to 09-03-2025",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "96.00 GBP",
    due: "96.00 GBP",
    paid: "96.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "1 Usman",
    email: "usman@example.com",
    period: "21-10-2024 to 27-10-2024",
    bookings: 6,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "1297.00 GBP",
    due: "1297.00 GBP",
    paid: "1297.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "10 Aftab Khan",
    email: "aftabkhan@example.com",
    period: "13-05-2024 to 19-05-2024",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "190.00 GBP",
    due: "190.00 GBP",
    paid: "190.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "104 Abbas",
    email: "abbas@example.com",
    period: "17-07-2023 to 23-07-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "146.00 GBP",
    due: "146.00 GBP",
    paid: "146.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "105 Raj Bagga",
    email: "rajbagga@example.com",
    period: "29-05-2023 to 04-06-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "126.00 GBP",
    due: "126.00 GBP",
    paid: "126.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "0101 SC",
    email: "sc@example.com",
    period: "01-04-2025 to 05-04-2025",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "97.50 GBP",
    due: "97.50 GBP",
    paid: "0.00 GBP",
    received: "0 GBP",
  },
];

export const statementsPayment = {
  Pending: [
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 amir Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "kareem",
      amount: "398.50",
    },
  ],
  Completed: [
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      statement: "24/Mar/2025 - 30/Mar/2025",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      statement: "09/Mar/2025 - 30/Mar/2025",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
  ],
  Deleted: [],
};

export const companyAccountsData = [
  {
    company: "RBS Company",
    email: "helan@negup.com",
    phone: "+444578415263",
    website: "https://www.megatransfers.com/",
    address: "Address 1, Address 1",
    city: "Test City",
    state: "",
    postcode: "859652",
    country: "United Kingdom",
    primaryContact: "Test Account",
    designation: "Director",
    tax: "None",
    locationsDisplay: "Yes",
    paymentOptionsBooking: "Cash,Card,Invoice",
    paymentOptionsInvoice: "Cash",
    invoiceDueDays: "1",
    invoiceTerms: "",
    passphrase: "",
    status: "Active",
    created: "2025-04-01",
  },
  {
    company: "Mega Transfers Limited",
    logo: IMAGES.profileimg,
    primaryContact: "+442089611818 (+447930844247)",
    email: "admin@megatransfers.co.uk",
    phone: "+442089611818",
    due: "0.00",
    created: "2024-09-02 06:58:51",
    status: "Pending",
  },
  {
    company: "London City Travels",
    logo: IMAGES.profileimg,
    primaryContact: "Test (Director)",
    email: "test.customer@cabcher.com",
    phone: "+44123456765432",
    due: "0.00",
    created: "2024-09-16 13:41:46",
    status: "Verified",
  },
  {
    company: "SkyLine Tours",
    logo: IMAGES.profileimg,
    primaryContact: "Nadia Khan",
    email: "nadia@skyline.com",
    phone: "+447700900111",
    due: "55.00",
    created: "2024-08-25 12:15:00",
    status: "Suspended",
  },
  {
    company: "Fast Wheels Travel",
    logo: IMAGES.profileimg,
    primaryContact: "Imran Hashmi",
    email: "imran@fastwheels.com",
    phone: "+447855331122",
    due: "120.00",
    created: "2024-07-19 18:05:30",
    status: "Finished",
  },
  {
    company: "Bright Move Co.",
    logo: IMAGES.profileimg,
    primaryContact: "Zara Mirza",
    email: "zara@brightmove.com",
    phone: "+447841123456",
    due: "0.00",
    created: "2024-09-01 11:00:00",
    status: "Delete Pending",
  },
  {
    company: "Capital Cars Ltd.",
    logo: IMAGES.profileimg,
    primaryContact: "Haris Naveed",
    email: "haris@capitalcars.com",
    phone: "+447980998877",
    due: "0.00",
    created: "2024-08-11 09:00:00",
    status: "Active",
  },
  {
    company: "Alpha Executive Rides",
    logo: IMAGES.profileimg,
    primaryContact: "Faizan Sheikh",
    email: "faizan@alphaexec.com",
    phone: "+447911000222",
    due: "75.50",
    created: "2024-08-05 14:45:00",
    status: "Verified",
  },
  {
    company: "Royal Airport Transfers",
    logo: IMAGES.profileimg,
    primaryContact: "Sana Khalid",
    email: "sana@royaltransfers.com",
    phone: "+447900334455",
    due: "10.00",
    created: "2024-08-12 07:30:00",
    status: "Pending",
  },
];

export const adminsListData = [
  {
    type: "Admin",
    name: "Admin",
    email: "bookings@megatransfers.co.uk",
    lastLogin: "11-04-2025 09:55",
    status: "Active",
  },
  {
    type: "User",
    name: "Admin",
    email: "asdsadasdas@megatransfers.co.uk",
    lastLogin: "11-04-2025 09:55",
    status: "Pending",
  },
  {
    type: "User",
    name: "Admin",
    email: "bookings@megatransfers.co.uk",
    lastLogin: "11-04-2025 09:55",
    status: "Active",
  },
];

export const vehicleData = [
  {
    priority: 0,
    vehicleName: "Standard Saloon",
    passengers: 3,
    smallLuggage: 2,
    largeLuggage: 2,
    childSeat: 2,
    price: "0.00%",
    image: "/images/standard.png",
  },
  {
    priority: 1,
    vehicleName: "Executive Saloon",
    passengers: 3,
    smallLuggage: 2,
    largeLuggage: 2,
    childSeat: 1,
    price: "20.00%",
    image: "/images/executive.png",
  },
  {
    priority: 2,
    vehicleName: "VIP Saloon",
    passengers: 3,
    smallLuggage: 2,
    largeLuggage: 2,
    childSeat: 0,
    price: "50.00%",
    image: "/images/vip.png",
  },
  {
    priority: 3,
    vehicleName: "Luxury MPV",
    passengers: 6,
    smallLuggage: 6,
    largeLuggage: 6,
    childSeat: 2,
    price: "50.00%",
    image: "/images/luxury-mpv.png",
  },
  {
    priority: 4,
    vehicleName: "8 Passenger MPV",
    passengers: 8,
    smallLuggage: 6,
    largeLuggage: 6,
    childSeat: 2,
    price: "55.00%",
    image: "/images/8-mpv.png",
  },
];

export const hourlyData = [
  {
    distance: 40,
    hours: 4,
    standardSaloon: 160,
    executiveSaloon: 200,
    vipSaloon: 280,
    luxuryMpv: 280,
    passengerMpv: 300,
  },
  {
    distance: 60,
    hours: 6,
    standardSaloon: 240,
    executiveSaloon: 300,
    vipSaloon: 420,
    luxuryMpv: 420,
    passengerMpv: 450,
  },
  {
    distance: 80,
    hours: 8,
    standardSaloon: 320,
    executiveSaloon: 400,
    vipSaloon: 560,
    luxuryMpv: 560,
    passengerMpv: 600,
  },
  {
    distance: 100,
    hours: 10,
    standardSaloon: 400,
    executiveSaloon: 500,
    vipSaloon: 700,
    luxuryMpv: 700,
    passengerMpv: 750,
  },
];

export const distanceslabData = [
  {
    start: 0,
    end: 0,
    standard: 60,
    executive: 70,
    vip: 80,
    luxury: 80,
    passenger: 80,
  },
  {
    start: 0,
    end: 10,
    standard: 2,
    executive: 3,
    vip: 4,
    luxury: 5,
    passenger: 5,
  },
  {
    start: 10,
    end: 20,
    standard: 2.5,
    executive: 3.5,
    vip: 4.5,
    luxury: 5.5,
    passenger: 5.75,
  },
  {
    start: 20,
    end: 1000,
    standard: 2.25,
    executive: 3.25,
    vip: 3.75,
    luxury: 3.75,
    passenger: 4,
  },
  {
    start: 0,
    end: 0,
    standard: 60,
    executive: 70,
    vip: 80,
    luxury: 80,
    passenger: 80,
  },
  {
    start: 0,
    end: 10,
    standard: 2,
    executive: 3,
    vip: 4,
    luxury: 5,
    passenger: 5,
  },
  {
    start: 10,
    end: 20,
    standard: 2.5,
    executive: 3.5,
    vip: 4.5,
    luxury: 5.5,
    passenger: 5.75,
  },
  {
    start: 20,
    end: 1000,
    standard: 2.25,
    executive: 3.25,
    vip: 3.75,
    luxury: 3.75,
    passenger: 4,
  },
];

export const driverfarebData = [
  {
    start: 0,
    end: 0,
    standard: 60,
    executive: 70,
    vip: 80,
    luxury: 80,
    passenger: 80,
  },
];

export const congestionchargesData = [
  {
    caption: "Parking",
    locations: "RH6, TW6",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    fromTime: "00:00",
    toTime: "23:55",
    category: "Surcharge",
    priceType: "Amount",
    price: 10.0,
  },
];

export const surchargeDateData = [
  {
    caption: "New Years Day",
    recurring: "Yearly",
    fromDate: "01-Jan 00:00",
    toDate: "01-Jan 23:55",
    category: "Surcharge",
    priceType: "Percentage",
    price: 50,
    status: "Active",
  },
  {
    caption: "New Years Day",
    recurring: "Yearly",
    fromDate: "01-Jan 00:00",
    toDate: "01-Jan 23:55",
    category: "Surcharge",
    priceType: "Percentage",
    price: 50,
    status: "Active",
  },
];

export const surchargeLocationData = [
  {
    locationType: "Pickup",
    location: "W1A 1AA",
    category: "Surcharge",
    priceType: "Amount",
    price: 5.0,
  },
  {
    locationType: "Dropoff",
    location: "EC2V 7HH",
    category: "Discount",
    priceType: "Percentage",
    price: 10.0,
  },
  {
    locationType: "Both",
    location: "Manchester Zone 3",
    category: "Surcharge",
    priceType: "Amount",
    price: 7.5,
  },
  {
    locationType: "Pickup",
    location: "Birmingham B1",
    category: "Discount",
    priceType: "Percentage",
    price: 15.0,
  },
  {
    locationType: "Dropoff",
    location: "Leeds LS1",
    category: "Surcharge",
    priceType: "Amount",
    price: 4.25,
  },
];

export const vouchersData = [
  {
    voucher: "First100",
    quantity: 100,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2024-10-31T10:40",
    applied: 1,
    used: 0,
    status: "Expired",
  },
  {
    voucher: "First10",
    quantity: 100,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2023-04-30T21:55",
    applied: 1,
    used: 0,
    status: "Deleted",
  },
  {
    voucher: "ILFORD10",
    quantity: 10,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2023-06-30T09:55",
    applied: 1,
    used: 0,
    status: "Deleted",
  },
  {
    voucher: "test1",
    quantity: 1,
    applicable: "All Users",
    discountType: "Amount",
    discountValue: 140.0,
    validity: "2023-07-31T13:05",
    applied: 1,
    used: 1,
    status: "Deleted",
  },
  {
    voucher: "BLDiscount10",
    quantity: 100,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2024-06-30T22:35",
    applied: 1,
    used: 0,
    status: "Deleted",
  },
];

export const fixedPricingData = [
  {
    direction: "Both Ways",
    pickup: "AL1, AL2, AL3, AL4",
    dropoff: "London Gatwick Zone",
    price: 160.0,
  },
  {
    direction: "Pickup",
    pickup: "AL1, AL2, AL3, AL4, AL10",
    dropoff: "STN",
    price: 100.0,
  },
  {
    direction: "Pickup",
    pickup: "AL1, AL2, AL3, AL4, AL5, AL6, AL7, AL8, AL9, AL10",
    dropoff: "Heathrow",
    price: 90.0,
  },
];
