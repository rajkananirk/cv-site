import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

interface BudgetOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
  currentMonth: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function BudgetOverview({ budgets, transactions, currentMonth }: BudgetOverviewProps) {
  const getBudgetUsage = (budgets: Budget) => {
    const spent = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budgets.category
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budgets.amount) * 100;

    return {
      category: budgets.category,
      spent,
      budget: budgets.amount,
      remaining: budgets.amount - spent,
      percentage: isNaN(percentage) ? 0 : percentage
    };
  };
  const budgetUsage = budgets
    // .filter(b => b.month === currentMonth)
    .map(getBudgetUsage)
    .filter(usage => usage.budget > 0); // Only show categories with budgets set

  const pieData = budgetUsage.map(({ category, spent }) => ({
    name: category,
    value: spent
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview - {currentMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetUsage.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No budgets set for this month
            </div>
          ) : (
            <div className="space-y-4">
              {budgetUsage.map(({ category, spent, budget, percentage }) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{category}</span>
                    <span>
                      ${spent.toFixed(2)} / ${budget.toFixed(2)}
                    </span>
                  </div>
                  ({percentage.toFixed(1)}%)
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${percentage > 90 ? 'bg-red-200' : ''}`}
                  />
                  {percentage > 90 && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>
                        Warning: {category} budget is {percentage > 100 ? 'exceeded' : 'nearly exceeded'} 
                        ({percentage.toFixed(1)}%)
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
     
    </div>
  );
} 