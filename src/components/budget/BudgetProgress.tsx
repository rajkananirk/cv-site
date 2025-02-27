import { Progress } from "../ui/progress";

interface BudgetProgressProps {
  category: string;
  spent: number;
  budget: number;
}

export function BudgetProgress({ category, spent = 0, budget = 0 }: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - spent, 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize">{category}</span>
        <span className="text-muted-foreground">
          ${(spent || 0).toFixed(2)} / ${(budget || 0).toFixed(2)}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="text-sm text-muted-foreground">
        ${remaining.toFixed(2)} remaining
      </div>
    </div>
  );
} 