import React from "react";
import transactions from "../assets/transactions.svg";

function NoTransactions() {
  return (
    <div className="flex flex-col items-center justify-center w-full mb-8">
      <img src={transactions} alt="No Transactions" className="w-[400px] my-16" />
      <p className="text-center text-lg">
        You Have No Transactions Currently
      </p>
    </div>
  );
}

export default NoTransactions;
