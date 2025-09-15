// components/dashboard/sales-person-won-chart.tsx
// import { getSalesPersonWonAmount } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default async function SalesPersonWonChart() {
//   const data = await getSalesPersonWonAmount()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Person vs Won Amount</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer> */}
        </div>
      </CardContent>
    </Card>
  )
}