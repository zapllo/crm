// src/components/dashboard/sections/PipelineView.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineData } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PipelineView({ data }: { data: PipelineData[] }) {
  const totalValue = data.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((stage, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{stage.stage}</span>
                <span className="text-sm text-muted-foreground">
                  ${stage.value.toLocaleString()} ({stage.count} deals)
                </span>
              </div>
              <Progress 
                value={(stage.value / totalValue) * 100} 
                className="h-2"
              />
              
              <Table className="mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Probability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stage.deals.slice(0, 3).map((deal, dealIndex) => (
                    <TableRow key={dealIndex}>
                      <TableCell>{deal.name}</TableCell>
                      <TableCell>{deal.company}</TableCell>
                      <TableCell>${deal.value.toLocaleString()}</TableCell>
                      <TableCell>{stage.probability}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {stage.deals.length > 3 && (
                <Button variant="link" className="mt-2">
                  View all {stage.deals.length} deals
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}