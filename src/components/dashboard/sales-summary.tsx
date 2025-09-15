import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSalesSummary } from "@/lib/api/dashboard"

export default async function SalesSummary({ type }: { type: "total" | "open" | "won" | "lost" }) {
//   const data = await getSalesSummary(type)
  
  const titles = {
    total: "Total",
    open: "Open",
    won: "Won",
    lost: "Lost"
  }
  
  const getStatusColor = () => {
    switch(type) {
      case "total": return "text-blue-500"
      case "open": return "text-yellow-500"
      case "won": return "text-green-500"
      case "lost": return "text-red-500"
      default: return "text-gray-500"
    }
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {/* {titles[type]} <span className="text-muted-foreground">({data.count})</span> */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {/* <div className="text-2xl font-bold">₹{data.amount.toLocaleString()}</div> */}
          <div className={`text-xs ${getStatusColor()}`}>
            {/* {data.percentChange > 0 ? '+' : ''}{data.percentChange}% */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}