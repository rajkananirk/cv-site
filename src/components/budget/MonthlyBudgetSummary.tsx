import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

interface Budget {
  category: string;
  amount: number;
  month: string;
}

interface Transaction {
  _id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string;
}

interface MonthlyBudgetSummaryProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export function MonthlyBudgetSummary({ budgets, transactions }: MonthlyBudgetSummaryProps) {
  // Group budgets by month
  const groupedBudgets = budgets.reduce((acc, budget) => {
    if (!acc[budget.month]) {
      acc[budget.month] = [];
    }
    acc[budget.month].push(budget);
    return acc;
  }, {} as Record<string, Budget[]>);

  // Sort months in descending order
  const sortedMonths = Object.keys(groupedBudgets).sort((a, b) => b.localeCompare(a));

  const getMonthlyUsage = (month: string, budgets: Budget[]) => {
    const monthlyTransactions = transactions.filter(t => 
      t.type === 'expense' && t.date.startsWith(month)
    );

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (totalSpent / totalBudget) * 100;

    return {
      totalBudget,
      totalSpent,
      percentage: isNaN(percentage) ? 0 : percentage
    };
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sortedMonths.map((month) => {
            const monthlyBudgets = groupedBudgets[month];
            const { totalBudget, totalSpent, percentage } = getMonthlyUsage(month, monthlyBudgets);

            return (
              <AccordionItem key={month} value={month}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between w-full">
                      <span>{formatMonth(month)}</span>
                      <span className="text-muted-foreground">
                        ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 mt-2 ${percentage > 90 ? 'bg-red-200' : ''}`}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-4">
                    {monthlyBudgets.map((budget) => {
                      const spent = transactions
                        .filter(t => 
                          t.type === 'expense' && 
                          t.category === budget.category &&
                          t.date.startsWith(month)
                        )
                        .reduce((sum, t) => sum + t.amount, 0);
                      
                      const categoryPercentage = (spent / budget.amount) * 100;

                      return (
                        <div key={budget.category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">
                              {budget.category}
                            </span>
                            <span>
                              ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                            </span>
                          </div>
                          <Progress 
                            value={categoryPercentage} 
                            className={`h-2 ${categoryPercentage > 90 ? 'bg-red-200' : ''}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
} 