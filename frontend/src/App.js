// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [dailyBalance, setDailyBalance] = useState([]);
  const [monthlyBalance, setMonthlyBalance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    amount: '',
    date: '',
    installment_count: '',
    interest: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchDailyBalance();
    fetchMonthlyBalance();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    const response = await axios.get('/get_transactions');
    setTransactions(response.data);
  };

  const fetchDailyBalance = async () => {
    const response = await axios.get('/get_daily_balance');
    setDailyBalance(response.data);
  };

  const fetchMonthlyBalance = async () => {
    const response = await axios.get('/get_monthly_balance');
    setMonthlyBalance(response.data);
  };

  const fetchSummary = async () => {
    const response = await axios.get('/get_summary');
    setSummary(response.data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/add_transaction', formData);
    fetchTransactions();
    fetchDailyBalance();
    fetchMonthlyBalance();
    fetchSummary();
  };

  const dailyBalanceData = {
    labels: dailyBalance.map(db => db.date),
    datasets: [{
      label: 'Saldo Diário',
      data: dailyBalance.map(db => db.balance),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: false
    }]
  };

  const monthlyBalanceData = {
    labels: monthlyBalance.map(mb => mb.month),
    datasets: [{
      label: 'Saldo Mensal',
      data: monthlyBalance.map(mb => mb.balance),
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      fill: false
    }]
  };

  const filteredTransactions = transactions.filter(transaction => {
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date('2000-01-01');
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const transactionDate = new Date(transaction.date);

    return (!filters.type || transaction.type === filters.type)
      && (!filters.category || transaction.category === filters.category)
      && transactionDate >= startDate
      && transactionDate <= endDate;
  });

  return (
    <div className="App">
      <h1>Controle Orçamentário</h1>
      <form onSubmit={handleSubmit}>
        <select name="type" onChange={handleInputChange}>
          <option value="">Tipo</option>
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
        <input type="text" name="category" placeholder="Categoria" onChange={handleInputChange} />
        <input type="number" name="amount" placeholder="Valor" onChange={handleInputChange} />
        <input type="date" name="date" placeholder="Data" onChange={handleInputChange} />
        <input type="number" name="installment_count" placeholder="Parcelas" onChange={handleInputChange} />
        <input type="number" name="interest" placeholder="Juros" onChange={handleInputChange} />
        <button type="submit">Adicionar Transação</button>
      </form>
      <h2>Filtros</h2>
      <div>
        <select name="type" onChange={handleFilterChange}>
          <option value="">Tipo</option>
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
        <input type="text" name="category" placeholder="Categoria" onChange={handleFilterChange} />
        <input type="date" name="startDate" placeholder="Data Inicial" onChange={handleFilterChange} />
        <input type="date" name="endDate" placeholder="Data Final" onChange={handleFilterChange} />
      </div>
      <h2>Transações Filtradas</h2>
      <ul>
        {filteredTransactions.map(transaction => (
          <li key={transaction.id}>
            {transaction.date} - {transaction.category} - {transaction.type} - {transaction.amount}
          </li>
        ))}
      </ul>
      <h2>Resumo de Despesas e Receitas</h2>
      <ul>
        {summary.map(item => (
          <li key={item.category}>
            {item.category} - Receita: {item.receita} - Despesa: {item.despesa}
          </li>
        ))}
      </ul>
      <h2>Saldo Diário</h2>
      <Line data={dailyBalanceData} />
      <h2>Saldo Mensal</h2>
      <Line data={monthlyBalanceData} />
    </div>
  );
}

export default App;
