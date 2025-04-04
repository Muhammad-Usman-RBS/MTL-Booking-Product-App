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

export const actionMenuItems = ["View", "Edit", "Cancel", "Delete", "Status Audit"];

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
