import { Landmark } from "lucide-react";
import { type BankAccount } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";

interface AccountCardProps {
  account: BankAccount;
}

export const AccountCard = ({ account }: AccountCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute right-0 top-0 p-4 opacity-5">
        <Landmark size={100} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Landmark size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">
            {account.bankName}
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Saldo Atual</p>
          <p
            className={`text-2xl font-bold ${
              account.currentBalance >= 0 ? "text-gray-900" : "text-red-600"
            }`}
          >
            {formatCurrency(account.currentBalance)}
          </p>
        </div>
      </div>
    </div>
  );
};
