export type EventType = {
    name: string,
    description: string,
    timings: {
        start: Date,
        end: Date
    },
    status: "Upcoming" | "Live" | "Hold" | "Ongoing" | "Archived",
    venue: {
        name: string,
        address: string
    },
    visibility: "Public" | "Private",
    managers?: [string],
    poster?: string,
    feedbackURL?: string,
    capacity?: number,
    contactDetails?: [{
        name: string,
        email: string,
        phone: string
    }]
}

export type CreateEventBody = {
    spaceId: string,
    eventDetails: EventType
}