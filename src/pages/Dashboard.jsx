import React, { useEffect, useState } from "react";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import TransactionSearch from "./TrasactionSearch";
import Header from "../components/Header/Header";
import AddIncomeModal from "../components/Modals/AddIncome";
import AddExpenseModal from "../components/Modals/AddExpense";
import Cards from "../components/Cards/Cards";
import NoTransactions from "./NoTransactions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import Loader from "../components/Loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { unparse } from "papaparse";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const navigate = useNavigate();

  // Standard
  // const processChartData = () => {
  //   const balanceData = [];
  //   const spendingData = {};

  //   transactions.forEach((transaction) => {
  //     const monthYear = moment(transaction.date).format("MMM YYYY");
  //     const tag = transaction.tag;

  //     if (transaction.type === "income") {
  //       if (balanceData.some((data) => data.month === monthYear)) {
  //         balanceData.find((data) => data.month === monthYear).balance +=
  //           transaction.amount;
  //       } else {
  //         balanceData.push({ month: monthYear, balance: transaction.amount });
  //       }
  //     } else {
  //       if (balanceData.some((data) => data.month === monthYear)) {
  //         balanceData.find((data) => data.month === monthYear).balance -=
  //           transaction.amount;
  //       } else {
  //         balanceData.push({ month: monthYear, balance: -transaction.amount });
  //       }

  //       if (spendingData[tag]) {
  //         spendingData[tag] += transaction.amount;
  //       } else {
  //         spendingData[tag] = transaction.amount;
  //       }
  //     }
  //   });

  //   const spendingDataArray = Object.keys(spendingData).map((key) => ({
  //     category: key,
  //     value: spendingData[key],
  //   }));

  //   return { balanceData, spendingDataArray };
  // };


  // For line chart between months and balance
//   const processChartData = () => {
//   const monthlyMap = {};
//   const spendingData = {};

//   // Group income and expenses by month
//   transactions.forEach((transaction) => {
//     const monthKey = moment(transaction.date).format("YYYY-MM"); // for sorting
//     const displayMonth = moment(transaction.date).format("MMM YYYY");
//     const tag = transaction.tag;

//     if (!monthlyMap[monthKey]) {
//       monthlyMap[monthKey] = {
//         monthKey,
//         month: displayMonth,
//         income: 0,
//         expense: 0,
//       };
//     }

//     if (transaction.type === "income") {
//       monthlyMap[monthKey].income += transaction.amount;
//     } else {
//       monthlyMap[monthKey].expense += transaction.amount;

//       if (spendingData[tag]) {
//         spendingData[tag] += transaction.amount;
//       } else {
//         spendingData[tag] = transaction.amount;
//       }
//     }
//   });

//   // Sort months chronologically
//   const sortedMonths = Object.values(monthlyMap).sort(
//     (a, b) => new Date(a.monthKey) - new Date(b.monthKey)
//   );

//   // Calculate cumulative balance
//   let cumulativeBalance = 0;
//   const balanceData = sortedMonths.map((item) => {
//     cumulativeBalance += item.income - item.expense;
//     return {
//       month: item.month,
//       balance: cumulativeBalance,
//     };
//   });

//   const spendingDataArray = Object.keys(spendingData).map((key) => ({
//     category: key,
//     value: spendingData[key],
//   }));

//   return { balanceData, spendingDataArray };
// };


// for line chart between weeks and balance
  const processChartData = () => {
  const weeklyMap = {};
  const spendingData = {};

  transactions.forEach((transaction) => {
    const weekStart = moment(transaction.date).startOf('week').format("YYYY-MM-DD"); // Sunday as start
    const displayWeek = moment(weekStart).format("DD MMM YYYY");
    const tag = transaction.tag;

    if (!weeklyMap[weekStart]) {
      weeklyMap[weekStart] = {
        weekKey: weekStart,
        week: displayWeek,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      weeklyMap[weekStart].income += transaction.amount;
    } else {
      weeklyMap[weekStart].expense += transaction.amount;

      if (spendingData[tag]) {
        spendingData[tag] += transaction.amount;
      } else {
        spendingData[tag] = transaction.amount;
      }
    }
  });

  // Sort weeks chronologically
  const sortedWeeks = Object.values(weeklyMap).sort(
    (a, b) => new Date(a.weekKey) - new Date(b.weekKey)
  );

  // Calculate cumulative balance
  let cumulativeBalance = 0;
  const balanceData = sortedWeeks.map((item) => {
    cumulativeBalance += item.income - item.expense;
    return {
      week: item.week,
      balance: cumulativeBalance,
    };
  });

  const spendingDataArray = Object.keys(spendingData).map((key) => ({
    category: key,
    value: spendingData[key],
  }));

  return { balanceData, spendingDataArray };
};




  const { balanceData, spendingDataArray } = processChartData();
  const showExpenseModal = () => setIsExpenseModalVisible(true);
  const showIncomeModal = () => setIsIncomeModalVisible(true);
  const handleExpenseCancel = () => setIsExpenseModalVisible(false);
  const handleIncomeCancel = () => setIsIncomeModalVisible(false);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const onFinish = (values, type) => {
    const newTransaction = {
      type,
      date: values.date.format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions([...transactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
    calculateBalance();
  };

  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      transaction.type === "income"
        ? (incomeTotal += transaction.amount)
        : (expensesTotal += transaction.amount);
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  async function addTransaction(transaction, many) {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      if (!many) toast.success("Transaction Added!");
    } catch (e) {
      if (!many) toast.error("Couldn't add transaction");
    }
  }

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      const transactionsArray = querySnapshot.docs.map((doc) => doc.data());
      setTransactions(transactionsArray);
      toast.success("Transactions Fetched!");
    }
    setLoading(false);
  }

  // for monthly balance chart
  // const balanceConfig = {
  //   data: balanceData,
  //   xField: "month",
  //   yField: "balance",
  //   smooth: true,
  //   autoFit: true,
  //   height: 300,
  // };

  // for weekly balance chart
  const balanceConfig = {
  data: balanceData,
  xField: "week", // changed from "month"
  yField: "balance",
  smooth: true,
  autoFit: true,
  height: 300,
};

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
    radius: 1,
    innerRadius: 0.6,
    height: 300,
  };

  const exportToCsv = () => {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={income}
            expenses={expenses}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            cardStyle={{}}
            reset={() => console.log("resetting")}
          />

          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />

          {transactions.length === 0 ? (
            <NoTransactions />
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 mt-6">
              <div className="shadow-md rounded-lg p-4 sm:p-6 w-full lg:w-3/5 bg-white">
                <h2 className="text-xl font-semibold mb-4">Financial Statistics</h2>
                <Line {...balanceConfig} />
              </div>
              <div className="shadow-md rounded-lg p-4 sm:p-6 w-full lg:w-2/5 bg-white">
                <h2 className="text-xl font-semibold mb-4">Total Spending</h2>
                {spendingDataArray.length === 0 ? (
                  <p className="text-gray-600">Seems like you haven't spent anything till now...</p>
                ) : (
                  <Pie {...spendingConfig} />
                )}
              </div>
            </div>
          )}

          <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;