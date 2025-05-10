const form = document.getElementById('transactionForm');
const transactionTable = document.getElementById('transactionTable');
const totalBalanceElement = document.getElementById('totalBalance');
const totalIncomeElement = document.getElementById('totalIncome');
const totalExpenseElement = document.getElementById('totalExpense');
const emptyState = document.getElementById('emptyState');
const filterSelect = document.getElementById('filter');
const chartContainer = document.querySelector('.chart-container');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const formatCurrency = (amount) => '₹' + amount.toFixed(2);

// --- Date Handling ---
const today = new Date().toISOString().split('T')[0];
const lastUpdated = localStorage.getItem('lastUpdated');

if (lastUpdated !== today) {
  alert("Hey! You haven't updated your income/expenses today. Don't forget!");
}

const updateLastUpdated = () => {
  localStorage.setItem('lastUpdated', today);
};

// --- Calculate Totals ---
const calculateTotals = (filteredTransactions) => {
  const totals = filteredTransactions.reduce((acc, t) => {
    const amount = parseFloat(t.amount);
    t.type === 'income' ? acc.income += amount : acc.expense += amount;
    return acc;
  }, { income: 0, expense: 0 });
  totals.balance = totals.income - totals.expense;
  return totals;
};

// --- Filter by Period ---
const filterTransactions = () => {
  const filter = filterSelect.value;
  const now = new Date();
  return transactions.filter(t => {
    const tDate = new Date(t.date);
    if (filter === 'year') {
      return tDate.getFullYear() === now.getFullYear();
    } else if (filter === 'month') {
      return tDate.getFullYear() === now.getFullYear() && tDate.getMonth() === now.getMonth();
    } else if (filter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return tDate >= oneWeekAgo && tDate <= now;
    }
    return true;
  });
};

// --- Render Table ---
const renderTransactions = () => {
  transactionTable.innerHTML = '';
  const filtered = filterTransactions();

  if (filtered.length === 0) {
    emptyState.classList.remove('d-none');
  } else {
    emptyState.classList.add('d-none');
    filtered.forEach((t, index) => {
      const formattedDate = new Date(t.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td class="${t.type === 'income' ? 'text-success' : 'text-danger'}">${formatCurrency(t.amount)}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteTransaction(${index})">Delete</button></td>
      `;
      transactionTable.appendChild(row);
    });
  }
  updateSummary(filtered);
  renderChart(filtered);
};

// --- Update Summary Cards ---
const updateSummary = (filtered) => {
  const totals = calculateTotals(filtered);
  totalBalanceElement.textContent = formatCurrency(totals.balance);
  totalIncomeElement.textContent = formatCurrency(totals.income);
  totalExpenseElement.textContent = formatCurrency(totals.expense);
};

// --- Render Chart ---
let myChart;
const renderChart = (filtered) => {
  if (myChart) myChart.destroy();

  const expenseData = {};
  // ✅ Dynamically collect categories and amounts
  filtered.forEach(t => {
    if (t.type === 'expense') {
      expenseData[t.category] = (expenseData[t.category] || 0) + parseFloat(t.amount);
    }
  });

  // Filter categories with amount > 0
  const chartLabels = Object.keys(expenseData);
  const chartData = chartLabels.map(cat => expenseData[cat]);

  if (chartData.length === 0) {
    chartContainer.innerHTML = '<p class="text-center text-muted">No expense data to display</p>';
    return;
  }

  chartContainer.innerHTML = '<canvas id="spendingChart"></canvas>';
  const ctx = document.getElementById('spendingChart').getContext('2d');

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#8AC249', '#EA80FC',
          '#FF5733', '#33FFCE', '#FFC300', '#C70039'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
};

// --- Add Transaction ---
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;

  if (!amount || !type || !category || !date) return;

  const newTransaction = {
    amount,
    type,
    category,
    date
  };

  transactions.push(newTransaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateLastUpdated();
  form.reset();
  renderTransactions();
});

// --- Delete Transaction ---
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
}

// --- Initialize ---
filterSelect.addEventListener('change', renderTransactions);
window.addEventListener('DOMContentLoaded', renderTransactions);
