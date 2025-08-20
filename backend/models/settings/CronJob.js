import mongoose from "mongoose";

const cronJobSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    autoAllocation: {
        enabled: {
            type: Boolean,
            default: false
        },
        timing: {
            hours: {
                type: String,
                enum: [
                    "0 hours", 
                    "1 hour", 
                    "2 hours", 
                    "3 hours", 
                    "4 hours", 
                    "5 hours",
                    "6 hours",
                    "12 hours",
                    "24 hours"
                ],
                default: "0 hours"
            },
            period: {
                type: String,
                enum: ["before pickup time", "after pickup time"],
                default: "before pickup time"
            }
        },
        notifications: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: true
            }
        }
    },
    reviews: {
        enabled: {
            type: Boolean,
            default: true
        },
        timing: {
            hours: {
                type: String,
                enum: [
                    "30 minutes",
                    "1 hours", 
                    "2 hours", 
                    "3 hours", 
                    "4 hours", 
                    "6 hours",
                    "12 hours",
                    "24 hours"
                ],
                default: "1 hours"
            }
        },
        notifications: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: true
            }
        }
    },
    driverDocumentsExpiration: {
        enabled: {
            type: Boolean,
            default: false
        },
        timing: {
            dailyTime: {
                type: String,
                enum: [
                    "00:00 - 01:00",
                    "01:00 - 02:00",
                    "02:00 - 03:00",
                    "03:00 - 04:00",
                    "04:00 - 05:00",
                    "05:00 - 06:00",
                    "06:00 - 07:00",
                    "07:00 - 08:00",
                    "08:00 - 09:00",
                    "09:00 - 10:00",
                    "10:00 - 11:00",
                    "11:00 - 12:00",
                    "12:00 - 13:00",
                    "13:00 - 14:00",
                    "14:00 - 15:00",
                    "15:00 - 16:00",
                    "16:00 - 17:00",
                    "17:00 - 18:00",
                    "18:00 - 19:00",
                    "19:00 - 20:00",
                    "20:00 - 21:00",
                    "21:00 - 22:00",
                    "22:00 - 23:00",
                    "23:00 - 24:00"
                ],
                default: "16:00 - 17:00"
            }
        },
        notifications: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
        }
    },
    driverStatement: {
        enabled: {
            type: Boolean,
            default: false
        },
        timing: {
            frequency: {
                type: String,
                enum: [
                    "Daily",
                    "Weekly", 
                    "Bi-weekly",
                    "Monthly",
                    "Quarterly"
                ],
                default: "Weekly"
            },
            day: {
                type: String,
                enum: [
                    "Monday", 
                    "Tuesday", 
                    "Wednesday", 
                    "Thursday", 
                    "Friday", 
                    "Saturday", 
                    "Sunday"
                ],
                default: "Monday"
            },
            time: {
                type: String,
                enum: [
                    "00:00 - 01:00",
                    "01:00 - 02:00", 
                    "02:00 - 03:00",
                    "03:00 - 04:00",
                    "04:00 - 05:00",
                    "05:00 - 06:00",
                    "06:00 - 07:00",
                    "07:00 - 08:00",
                    "08:00 - 09:00",
                    "09:00 - 10:00",
                    "10:00 - 11:00",
                    "11:00 - 12:00",
                    "12:00 - 13:00",
                    "13:00 - 14:00",
                    "14:00 - 15:00",
                    "15:00 - 16:00",
                    "16:00 - 17:00",
                    "17:00 - 18:00",
                    "18:00 - 19:00",
                    "19:00 - 20:00",
                    "20:00 - 21:00",
                    "21:00 - 22:00",
                    "22:00 - 23:00",
                    "23:00 - 24:00"
                ],
                default: "01:00 - 02:00"
            }
        },
        notifications: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    history: [
        {
            action: {
                type: String,
                enum: ["created", "updated", "disabled", "enabled"]
            },
            date: {
                type: Date,
                default: Date.now
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            changes: {
                type: mongoose.Schema.Types.Mixed
            }
        }
    ]
}, {
    timestamps: true
});

// Ensure only one cron job configuration per company
cronJobSchema.index({ companyId: 1 }, { unique: true });

// Pre-save middleware to validate timing configurations
cronJobSchema.pre('save', function(next) {
    // Validate that if frequency is Daily, day field should be ignored
    if (this.driverStatement.timing.frequency === 'Daily') {
        // For daily frequency, day is not relevant
        this.driverStatement.timing.day = undefined;
    }
    
    next();
});

// Method to get available time slots based on frequency
cronJobSchema.methods.getAvailableTimeSlots = function() {
    const frequency = this.driverStatement.timing.frequency;
    
    if (frequency === 'Daily') {
        return {
            showDaySelector: false,
            availableTimeSlots: [
                "00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00",
                "03:00 - 04:00", "04:00 - 05:00", "05:00 - 06:00",
                "22:00 - 23:00", "23:00 - 24:00"
            ]
        };
    } else {
        return {
            showDaySelector: true,
            availableTimeSlots: [
                "00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00",
                "03:00 - 04:00", "04:00 - 05:00", "05:00 - 06:00",
                "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00",
                "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
                "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
                "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
                "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00",
                "21:00 - 22:00", "22:00 - 23:00", "23:00 - 24:00"
            ]
        };
    }
};

const CronJob = mongoose.model("CronJob", cronJobSchema);
export default CronJob;