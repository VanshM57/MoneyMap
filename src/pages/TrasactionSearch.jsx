import React, { useRef, useState } from "react";
import { Input, Table, Select, Radio } from "antd";
import { parse } from "papaparse";
import { toast } from "react-toastify";
import search from "../assets/search.svg";

const { Option } = Select;

const TransactionSearch = ({
  transactions,
  exportToCsv,
  addTransaction,
  fetchTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const fileInput = useRef();

  function importFromCsv(event) {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            const newTransaction = {
              ...transaction,
              amount: parseInt(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.value = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Tag", dataIndex: "tag", key: "tag" },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = searchTerm
      ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;
    return searchMatch && tagMatch && typeMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    }
    return 0;
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-10">
      {/* Top Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-1 w-full md:w-1/2">
          <img src={search} alt="Search Icon" className="w-4 mr-2" />
          <input
            type="text"
            placeholder="Search by Name"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none bg-transparent"
          />
        </div>

        <Select
          className="w-full md:w-1/3"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Filter by Type"
          allowClear
        >
          <Option value="">All</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>

      {/* Sorting + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-center md:text-left">
          My Transactions
        </h2>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <Radio.Group
            className="flex flex-wrap gap-2"
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
          >
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300 w-full md:w-auto"
            onClick={exportToCsv}
          >
            Export to CSV
          </button>
          <label
            htmlFor="file-csv"
            className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 w-full md:w-auto text-center"
          >
            Import from CSV
          </label>
          <input
            onChange={importFromCsv}
            id="file-csv"
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInput}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto bg-white rounded-md shadow-sm">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default TransactionSearch;
