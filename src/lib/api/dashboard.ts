// Client-side functions to fetch dashboard data

export async function getSalesSummary(type: "open" | "won" | "lost") {
    const res = await fetch(`/api/dashboard?type=${type}`, { next: { revalidate: 300 } })

    if (!res.ok) {
        throw new Error('Failed to fetch sales summary')
    }

    const data = await res.json()
    return data.summary[type]
}

export async function getSalesReport(period: "daily" | "weekly" | "monthly" | "yearly") {
    const res = await fetch(`/api/dashboard/sales?period=${period}`, { next: { revalidate: 300 } })

    if (!res.ok) {
        throw new Error('Failed to fetch sales report')
    }

    return res.json()
}

export async function getLeadsAnalytics(type: string) {
    const res = await fetch(`/api/dashboard/leads?type=${type}`, { next: { revalidate: 300 } })

    if (!res.ok) {
        throw new Error('Failed to fetch leads analytics')
    }

    return res.json()
}

export async function getSalesPersonContribution() {
    const res = await fetch('/api/dashboard/sales-person', { next: { revalidate: 300 } })

    if (!res.ok) {
        throw new Error('Failed to fetch sales person contribution')
    }

    return res.json()
}