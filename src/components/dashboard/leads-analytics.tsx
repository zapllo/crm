import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
// import { getLeadsAnalytics } from "@/lib/api/dashboard"

export default async function LeadsAnalytics({ type }: { type: "daily" | "monthly" | "source" | "company" | "pipeline" | "salesPerson" | "stage" }) {
  // const data = await getLeadsAnalytics(type)
  
  const getColumnNames = () => {
    const common = ["Date", "Conversion"];
    const metrics = ["Total", "Open", "Won", "Lost"];
    
    if (type === "daily" || type === "monthly") {
      return [...common, ...metrics];
    }
    
    return ["Name", "Total", "Open", "Won", "Lost"];
  }
  
  const columnNames = getColumnNames();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columnNames.map(column => (
                <TableHead key={column} className={column !== "Date" && column !== "Name" ? "text-right" : ""}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {/* <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name || item.date}</TableCell>
                {item.conversion && (
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      {item.conversion}%
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-right">{item.total}</TableCell>
                <TableCell className="text-right">{item.open}</TableCell>
                <TableCell className="text-right">{item.won}</TableCell>
                <TableCell className="text-right">{item.lost}</TableCell>
              </TableRow>
            ))}
          </TableBody> */}
        </Table>
      </CardContent>
    </Card>
  )
}