import React from 'react'
import { Card, Row } from "antd";

const Cards = ({
  currentBalance,
  income,
  expenses,
  showExpenseModal,
  showIncomeModal,
  reset,
}) => {
  return (
    <Row className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap gap-6 justify-center items-stretch w-full px-4 mt-10">
      <Card
        className="shadow-[0_0_30px_8px_rgba(227,227,227,0.75)] rounded-lg min-w-[280px] w-full md:w-[45%] lg:w-[30%] p-6"
      >
        <h2 className="text-xl font-semibold text-black mb-2">
          Current Balance
        </h2>
        <p className="text-lg font-medium text-[#22C55E] mb-4">₹{currentBalance}</p>
        <div
          className="w-full text-center bg-blue-600 text-white border border-blue-600 rounded-md py-2 cursor-pointer hover:bg-white hover:text-blue-600 transition-all"
          onClick={reset}
        >
          Reset Balance
        </div>
      </Card>

      <Card
        className="shadow-[0_0_30px_8px_rgba(227,227,227,0.75)] rounded-lg min-w-[280px] w-full md:w-[45%] lg:w-[30%] p-6"
      >
        <h2 className="text-xl font-semibold text-black mb-2">Total Income</h2>
        <p className="text-lg font-medium text-[#22C55E] mb-4">₹{income}</p>
        <div
          className="w-full text-center bg-blue-600 text-white border border-blue-600 rounded-md py-2 cursor-pointer hover:bg-white hover:text-blue-600 transition-all"
          onClick={showIncomeModal}
        >
          Add Income
        </div>
      </Card>

      <Card
        className="shadow-[0_0_30px_8px_rgba(227,227,227,0.75)] rounded-lg min-w-[280px] w-full md:w-[45%] lg:w-[30%] p-6"
      >
        <h2 className="text-xl font-semibold text-black mb-2">Total Expenses</h2>
        <p className="text-lg font-medium text-[#EF4444] mb-4">₹{expenses}</p>
        <div
          className="w-full text-center bg-blue-600 text-white border border-blue-600 rounded-md py-2 cursor-pointer hover:bg-white hover:text-blue-600 transition-all"
          onClick={showExpenseModal}
        >
          Add Expense
        </div>
      </Card>
    </Row>
  )
}

export default Cards