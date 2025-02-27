import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "../components/ui/button";
import { TransactionForm } from '../components/transactions/TransactionForm';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BASE_URL } from '../lib/utils';
import { BudgetForm } from '../components/budget/BudgetForm';
import { TransactionList } from '../components/transactions/TransactionList';
import { BudgetOverview } from '../components/budget/BudgetOverview';
import { MonthlyBudgetSummary } from '../components/budget/MonthlyBudgetSummary';
import { Progress } from '../components/ui/progress';

interface Transaction {
  _id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface CategoryTotal {
  category: string;
  amount: number;
}

interface Budget {
  category: string;
  amount: number;
  month: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const {  logout } = useAuth();
  
  const [user, setUserData] = useState({});

  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showIncomeList, setShowIncomeList] = useState(false);
  const [showExpenseList, setShowExpenseList] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {  
    setUserData(localStorage.getItem('user') || null)
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(BASE_URL + '/api/transactions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data);

      // Calculate totals
      const income = data
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expenses = data
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      setTotalIncome(income);
      setTotalExpenses(expenses);

      // Calculate category totals for expenses
      const categoryMap = data
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((acc: { [key: string]: number }, t: Transaction) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});

      setCategoryTotals(
        Object.entries(categoryMap).map(([category, amount]) => ({
          category,
          amount: amount as number,
        }))
      );
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/budgets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch budgets');

      const data = await response.json();
      console.log('datadatadatadata=======', data);
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate savings for current month
  const currentMonthIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthSavings = currentMonthIncome - currentMonthExpenses;
  const savingsPercentage = currentMonthIncome > 0 
    ? (currentMonthSavings / currentMonthIncome) * 100 
    : 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {JSON.parse(localStorage.getItem('user') || '{}').name}</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowIncomeList(true)}
          >
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ${totalIncome.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowExpenseList(true)}
          >
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${(totalIncome - totalExpenses).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Savings</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className={`text-2xl font-bold ${currentMonthSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${currentMonthSavings.toFixed(2)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>Savings Rate:</span>
                  <span className={savingsPercentage >= 20 ? 'text-green-600' : 'text-yellow-600'}>
                    {savingsPercentage.toFixed(1)}%
                  </span>
                </div>
                {currentMonthIncome > 0 && (
                  <Progress 
                    value={Math.max(0, Math.min(savingsPercentage, 100))} 
                    className={`h-2 ${savingsPercentage >= 20 ? 'bg-green-200' : 'bg-yellow-200'}`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm onSuccess={fetchTransactions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Budget Management</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetForm onSuccess={fetchBudgets} />
          </CardContent>
        </Card>

        <div className="mt-6">
          <BudgetOverview
            budgets={budgets}
            transactions={transactions}
            currentMonth={currentMonth}
          />
        </div>

        <TransactionList
          isOpen={showIncomeList}
          onClose={() => setShowIncomeList(false)}
          transactions={transactions}
          type="income"
        />

        <TransactionList
          isOpen={showExpenseList}
          onClose={() => setShowExpenseList(false)}
          transactions={transactions}
          type="expense"
        />
      </div>
    </div>
  );
} 