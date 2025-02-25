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
    poster?: string,
    feedbackURL?: string,
    capacity?: number,
    managers?: [string],
    hosts?: [string],
    contactDetails?: [{
        name: string,
        email: string,
        phone: string
    }]
}

export type EventManager = string

export type EventHost = string

export type EventContactDetail = {
    name: string,
    email: string,
    phone: string
}

export type CreateEventBody = {
    spaceId: string,
    eventDetails: EventType
}

export type UpdateEventBody = {
    eventId: string,
    eventDetails: EventType
}

export type AddEventManagerBody = {
    eventId: string,
    manager: EventManager
}

export type AddEventHostBody = {
    eventId: string,
    hosts: EventHost
}

export type AddEventContactDetailBody = {
    eventId: string,
    contactDetail: EventContactDetail
}