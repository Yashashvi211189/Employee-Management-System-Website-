// Shared constants and utility functions for Admin Dashboard

export const isFile = (value: unknown): value is File =>
    typeof value === "object" && value instanceof File;

// Project constants
export const projectCategories = [
    "mobile",
    "fintech",
    "saas",
    "edtech",
    "ai",
    "blockchain",
    "devops",
    "ecommerce",
    "govtech",
    "enterprise",
];

export const productCategories = [
    "education",
    "business",
    "productivity",
    "analytics",
    "communication",
    "development",
    "design",
    "marketing",
    "finance",
    "healthcare",
];

export const colorOptions = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-emerald-600",
    "from-orange-500 to-red-600",
    "from-purple-500 to-pink-600",
    "from-indigo-500 to-blue-600",
    "from-gray-600 to-gray-800",
    "from-cyan-500 to-blue-600",
    "from-yellow-500 to-orange-600",
    "from-teal-500 to-green-600",
    "from-pink-500 to-rose-600",
    "from-violet-500 to-purple-600",
];

export const platformOptions = [
    "web",
    "mobile",
    "desktop",
    "cloud",
    "self-hosted",
    "api",
    "browser-extension",
];

export const integrationOptions = [
    "google-workspace",
    "microsoft-365",
    "slack",
    "zoom",
    "stripe",
    "paypal",
    "github",
    "gitlab",
    "jira",
    "notion",
    "salesforce",
    "hubspot",
];

export const supportOptions = [
    "email",
    "phone",
    "chat",
    "documentation",
    "tutorials",
    "community-forum",
    "dedicated-support",
    "training-sessions",
];

export const galleryCategories = [
    "all",
    "office",
    "events",
    "celebration",
    "others",
];

// Helper function for status colors
export const getStatusColor = (status: string) => {
    switch (status) {
        case "completed":
        case "Live":
            return "bg-green-500";
        case "ongoing":
        case "In Development":
            return "bg-blue-500";
        case "planned":
        case "Coming Soon":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

export const getStatusText = (status: string) => {
    switch (status) {
        case "completed":
            return "Completed";
        case "ongoing":
            return "Ongoing";
        case "planned":
            return "Planned";
        case "Live":
            return "Live";
        case "In Development":
            return "In Development";
        case "Coming Soon":
            return "Coming Soon";
        default:
            return status;
    }
};

export const getPricingTypeColor = (type: string) => {
    switch (type) {
        case "free":
            return "bg-green-100 text-green-800";
        case "paid":
            return "bg-blue-100 text-blue-800";
        case "freemium":
            return "bg-purple-100 text-purple-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};
