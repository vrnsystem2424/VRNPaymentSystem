import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  ListOrdered,
  Calendar,
  RefreshCw,
  X,
  Search,
  Building2,
  AlertCircle,
} from "lucide-react";
import {
  useGetMainBankSummaryQuery,
  useGetBankBalancesQuery,
  useGetOutstandingQuery,
} from "../../features/Summary/mainSummarySlice";

// ─────────────────────────────────────────────
// ChartJS Register
// ─────────────────────────────────────────────
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getUniqueIgnoreCase = (arr) => {
  const map = new Map();
  arr.forEach((item) => {
    if (item && item.toString().trim()) {
      const key = item.toString().toLowerCase().trim();
      if (!map.has(key)) map.set(key, item.toString().trim());
    }
  });
  return Array.from(map.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
};

const matchesIgnoreCase = (value, filterArray) => {
  if (!value) return false;
  const valueLower = value.toString().toLowerCase().trim();
  return filterArray.some(
    (f) => f.toString().toLowerCase().trim() === valueLower
  );
};

const parseAmount = (amountStr) => {
  if (!amountStr) return 0;
  return parseFloat(amountStr.toString().replace(/,/g, "")) || 0;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [datePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/");
  return new Date(`${year}-${month}-${day}`);
};

// ─────────────────────────────────────────────
// MULTI SELECT FILTER
// ─────────────────────────────────────────────
const MultiSelectFilter = ({
  label,
  value = [],
  onChange,
  options,
  placeholder,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAllSelected =
    value.length === options.filter((opt) => opt !== "All").length &&
    value.length > 0;

  const toggleOption = (option) => {
    if (option === "All") {
      if (isAllSelected) {
        onChange([]);
      } else {
        onChange(options.filter((opt) => opt !== "All"));
      }
      setInputValue("");
      setIsOpen(false);
      return;
    }
    let newValue = [...value];
    const existingIndex = newValue.findIndex(
      (v) => v.toLowerCase().trim() === option.toLowerCase().trim()
    );
    if (existingIndex !== -1) {
      newValue.splice(existingIndex, 1);
    } else {
      newValue.push(option);
    }
    onChange(newValue);
    setInputValue("");
  };

  const isOptionSelected = (option) => {
    if (option === "All") return isAllSelected;
    return value.some(
      (v) => v.toLowerCase().trim() === option.toLowerCase().trim()
    );
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt === "All" || opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative z-[150]" ref={wrapperRef}>
      <label
        className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
      </label>

      <div
        className={`relative w-full min-h-[46px] flex items-center rounded-xl border-2 transition-all duration-200 cursor-text
          ${
            isDarkMode
              ? "bg-gray-900/60 border-gray-700 hover:border-indigo-500"
              : "bg-white border-gray-300 hover:border-indigo-400 shadow-sm hover:shadow-md"
          }
          ${isOpen ? "ring-2 ring-indigo-500 border-indigo-500" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <div className="flex flex-wrap gap-2 pl-11 pr-10 py-2 w-full">
          {value.map((selected) => (
            <div
              key={selected}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
                isDarkMode
                  ? "bg-indigo-900/70 text-indigo-200 border-indigo-700"
                  : "bg-indigo-100 text-indigo-800 border-indigo-200"
              }`}
            >
              {selected}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(selected);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-black/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && inputValue === "" && value.length > 0)
                onChange(value.slice(0, -1));
              if (e.key === "Escape") setIsOpen(false);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            autoComplete="off"
            className={`flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm ${
              isDarkMode
                ? "text-white placeholder-gray-500"
                : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute z-[999] w-full mt-2 rounded-xl shadow-2xl border-2 overflow-hidden ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
          style={{ maxHeight: "320px" }}
        >
          <div className="overflow-y-auto max-h-[320px]">
            {filteredOptions.length === 0 && inputValue ? (
              <div
                className={`p-4 text-center ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors
                    ${
                      isOptionSelected(option)
                        ? isDarkMode
                          ? "bg-indigo-900/50 text-indigo-300 font-medium"
                          : "bg-indigo-100 text-indigo-800 font-medium"
                        : isDarkMode
                        ? "text-gray-200 hover:bg-gray-800"
                        : "text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <span className="truncate">{option}</span>
                  {isOptionSelected(option) && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                      }`}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
const StatCard = ({
  title,
  amount,
  color,
  icon,
  isBalance = false,
  isDarkMode,
  balanceValue,
}) => {
  const colorMap = {
    emerald: {
      bg: isDarkMode
        ? "bg-gradient-to-br from-emerald-900/60 to-teal-900/60"
        : "bg-gradient-to-br from-emerald-100/85 to-teal-100/75",
      text: isDarkMode ? "text-emerald-300" : "text-emerald-800",
      light: isDarkMode ? "bg-emerald-950/30" : "bg-emerald-200/40",
      titleText: isDarkMode ? "text-gray-400" : "text-gray-700",
      iconColor: isDarkMode ? "text-white" : "text-emerald-700",
    },
    rose: {
      bg: isDarkMode
        ? "bg-gradient-to-br from-rose-900/60 to-pink-900/60"
        : "bg-gradient-to-br from-rose-100/85 to-pink-100/75",
      text: isDarkMode ? "text-rose-300" : "text-rose-800",
      light: isDarkMode ? "bg-rose-950/30" : "bg-rose-200/40",
      titleText: isDarkMode ? "text-gray-400" : "text-gray-700",
      iconColor: isDarkMode ? "text-white" : "text-rose-700",
    },
  };

  const colors = colorMap[color] || colorMap.emerald;
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;

  let finalIconColor = colors.iconColor;
  if (isBalance) {
    finalIconColor = isDarkMode
      ? balanceValue >= 0
        ? "text-emerald-400"
        : "text-rose-400"
      : balanceValue >= 0
      ? "text-emerald-700"
      : "text-rose-700";
  }

  return (
    <div
      className={`rounded-2xl border shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden w-full p-6 lg:p-8
      ${
        isDarkMode
          ? "bg-black/30 border-gray-700/40"
          : "bg-white/80 border-gray-200/70"
      }`}
    >
      <div
        className={`absolute -right-10 -top-10 w-40 h-40 ${colors.light} rounded-full blur-3xl`}
      />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className={`p-4 rounded-xl ${colors.bg} shadow-lg`}>
            {React.cloneElement(icon, {
              size: 28,
              className: finalIconColor,
              strokeWidth: isDarkMode ? 2 : 2.2,
            })}
          </div>
        </div>
        <h3
          className={`text-sm lg:text-base font-semibold uppercase tracking-wider mb-2 ${colors.titleText}`}
        >
          {title}
        </h3>
        <p
          className={`text-3xl lg:text-4xl font-black tracking-tight ${colors.text}`}
        >
          ₹{safeAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BANK BALANCE COMPONENT - CLEAN (No Reconciliation)
// ─────────────────────────────────────────────
const BankBalance = ({ isDarkMode }) => {
  const {
    data: bankApiData,
    isLoading,
    isError,
    refetch,
  } = useGetBankBalancesQuery();

  const bankData = useMemo(() => {
    if (!bankApiData?.balances || !Array.isArray(bankApiData.balances))
      return [];

    return bankApiData.balances
      .map((item) => {
        const balanceStr = (item.Balance || "0").toString().trim();
        const balanceNum =
          parseFloat(balanceStr.replace(/,/g, "").replace(/₹/g, "")) || 0;
        return {
          bankName: (item.BankName || "Unknown").trim(),
          balance: balanceNum,
          balanceFormatted: balanceNum.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        };
      })
      .filter((b) => b.bankName !== "Unknown" && b.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [bankApiData]);

  const totalBalance = useMemo(
    () => bankData.reduce((sum, b) => sum + b.balance, 0),
    [bankData]
  );

  const barChartData = {
    labels: bankData.map((b) => b.bankName),
    datasets: [
      {
        label: "Bank Balance",
        data: bankData.map((b) => b.balance),
        backgroundColor: "rgba(16, 185, 129, 0.75)",
        borderColor: "#10b981",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(16, 185, 129, 0.95)",
      },
    ],
  };

  const barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: isDarkMode ? "#ffffff" : "#111827",
          font: { size: 13, weight: "600" },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: true,
        text: "Bank Balance Overview",
        color: isDarkMode ? "#ffffff" : "#111827",
        font: { size: 22, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: isDarkMode
          ? "rgba(17,24,39,0.96)"
          : "rgba(255,255,255,0.98)",
        titleColor: isDarkMode ? "#f3f4f6" : "#111827",
        bodyColor: isDarkMode ? "#f3f4f6" : "#111827",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) =>
            ` Balance: ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)",
        },
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { weight: "500" },
          callback: (v) =>
            "₹" + v.toLocaleString("en-IN", { notation: "compact" }),
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: isDarkMode ? "#d1d5db" : "#374151",
          font: { size: bankData.length > 10 ? 11 : 13, weight: "500" },
          maxRotation: 45,
          minRotation: 30,
          autoSkip: true,
        },
      },
    },
  };

  if (isLoading)
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-5" />
        <p
          className={`text-lg ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Loading bank balances...
        </p>
      </div>
    );

  if (isError || bankData.length === 0)
    return (
      <div
        className={`rounded-2xl p-10 text-center border max-w-lg mx-auto ${
          isDarkMode
            ? "bg-rose-950/20 border-rose-800/40"
            : "bg-rose-50 border-rose-200"
        }`}
      >
        <AlertCircle
          className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? "text-rose-400" : "text-rose-600"
          }`}
        />
        <h3
          className={`text-xl font-bold mb-2 ${
            isDarkMode ? "text-rose-300" : "text-rose-800"
          }`}
        >
          {isError ? "Failed to load balances" : "No bank data found"}
        </h3>
        <button
          onClick={refetch}
          className="mt-5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 mx-auto transition-colors"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* ── Total Balance Card ── */}
      <div className="grid grid-cols-1 gap-6">
        <div
          className={`rounded-2xl border shadow-2xl p-8 text-center ${
            isDarkMode
              ? "bg-gradient-to-br from-emerald-950/60 to-teal-950/50 border-emerald-800/50"
              : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
          }`}
        >
          <p
            className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
              isDarkMode ? "text-emerald-300/90" : "text-emerald-700"
            }`}
          >
            Current Total Balance
          </p>
          <p
            className={`text-4xl font-black tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ₹{totalBalance.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Bar Chart ── */}
      <div
        className={`rounded-2xl border shadow-2xl p-6 lg:p-10 ${
          isDarkMode
            ? "bg-black/40 border-indigo-800/50"
            : "bg-white/90 border-indigo-200/60"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3
            className={`text-2xl lg:text-3xl font-bold flex items-center gap-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Calendar
              className={`w-7 h-7 ${
                isDarkMode ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            Bank Balance Overview
          </h3>
          <span
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isDarkMode
                ? "bg-emerald-900/40 text-emerald-300"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            As of {new Date().toLocaleDateString("en-IN")}
          </span>
        </div>
        <div className="h-[420px] sm:h-[440px] lg:h-[480px] w-full">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* ── Bank List ── */}
      <div
        className={`rounded-2xl border shadow-xl overflow-hidden ${
          isDarkMode
            ? "bg-black/30 border-indigo-800/50"
            : "bg-white/90 border-indigo-200/60"
        }`}
      >
        <div
          className={`px-6 py-4 border-b font-semibold text-lg ${
            isDarkMode
              ? "bg-emerald-950/30 text-emerald-300 border-emerald-800/50"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          All Banks
        </div>
        <div className="divide-y divide-gray-700/30 max-h-[420px] overflow-y-auto">
          {bankData.map((bank, idx) => (
            <div
              key={idx}
              className={`px-6 py-4 transition-colors ${
                isDarkMode
                  ? "hover:bg-emerald-950/20"
                  : "hover:bg-emerald-50/60"
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-medium text-base ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {bank.bankName}
                </span>
                <span
                  className={`text-xl font-bold tracking-tight ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  ₹{bank.balanceFormatted}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// OUTSTANDING COMPONENT
// ─────────────────────────────────────────────
const Outstanding = ({ isDarkMode }) => {
  const {
    data: outstandingApiData,
    isLoading,
    isError,
    refetch,
  } = useGetOutstandingQuery();

  const [filters, setFilters] = useState({
    siteNames: [],
    vendorNames: [],
    expHeads: [],
    billNos: [],
  });

  const [showAll, setShowAll] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const hoverTimerRef = useRef(null);

  const rawData = useMemo(() => {
    if (
      !outstandingApiData?.transactions ||
      !Array.isArray(outstandingApiData.transactions)
    )
      return [];

    return outstandingApiData.transactions.map((item) => ({
      date: item.date || "—",
      billDate: item.billDate || "—",
      billPDF: item.billPDF || "",
      siteName: (item.siteName || "—").toString().trim(),
      vendorName: (item.vendorName || "—").toString().trim(),
      billNo: (item.billNo || "—").toString().trim(),
      expHead: (item.expHead || "—").toString().trim(),
      netAmount: parseAmount(item.netAmount),
      paidAmount: parseAmount(item.paidAmount),
      balance: parseAmount(item.balance),
    }));
  }, [outstandingApiData]);

  const filteredData = useMemo(() => {
    let data = [...rawData];
    if (filters.siteNames.length > 0 && !filters.siteNames.includes("All"))
      data = data.filter((t) =>
        matchesIgnoreCase(t.siteName, filters.siteNames)
      );
    if (filters.vendorNames.length > 0 && !filters.vendorNames.includes("All"))
      data = data.filter((t) =>
        matchesIgnoreCase(t.vendorName, filters.vendorNames)
      );
    if (filters.expHeads.length > 0 && !filters.expHeads.includes("All"))
      data = data.filter((t) =>
        matchesIgnoreCase(t.expHead, filters.expHeads)
      );
    if (filters.billNos.length > 0 && !filters.billNos.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.billNo, filters.billNos));
    return data.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [rawData, filters]);

  const filterOptions = useMemo(() => {
    const allSiteNames = getUniqueIgnoreCase(
      rawData.map((t) => t.siteName).filter((s) => s && s !== "—")
    );
    let current = [...rawData];
    if (filters.siteNames.length > 0 && !filters.siteNames.includes("All"))
      current = current.filter((t) =>
        matchesIgnoreCase(t.siteName, filters.siteNames)
      );
    const vendors = getUniqueIgnoreCase(
      current.map((t) => t.vendorName).filter((v) => v && v !== "—")
    );
    if (filters.vendorNames.length > 0 && !filters.vendorNames.includes("All"))
      current = current.filter((t) =>
        matchesIgnoreCase(t.vendorName, filters.vendorNames)
      );
    const heads = getUniqueIgnoreCase(
      current.map((t) => t.expHead).filter((h) => h && h !== "—")
    );
    if (filters.expHeads.length > 0 && !filters.expHeads.includes("All"))
      current = current.filter((t) =>
        matchesIgnoreCase(t.expHead, filters.expHeads)
      );
    const billNumbers = getUniqueIgnoreCase(
      current.map((t) => t.billNo).filter((b) => b && b !== "—")
    );
    return {
      siteNames: ["All", ...allSiteNames],
      vendorNames: ["All", ...vendors],
      expHeads: ["All", ...heads],
      billNos: ["All", ...billNumbers],
    };
  }, [rawData, filters.siteNames, filters.vendorNames, filters.expHeads]);

  const totalOutstanding = filteredData.reduce((sum, t) => sum + t.balance, 0);
  const totalNet = filteredData.reduce((sum, t) => sum + t.netAmount, 0);
  const totalPaid = filteredData.reduce((sum, t) => sum + t.paidAmount, 0);
  const activeFiltersCount =
    filters.siteNames.length +
    filters.vendorNames.length +
    filters.expHeads.length +
    filters.billNos.length;
  const displayedData = showAll ? filteredData : filteredData.slice(0, 10);

  if (isLoading)
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-5" />
        <p
          className={`text-lg ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Loading outstanding data...
        </p>
      </div>
    );

  if (isError || !rawData.length)
    return (
      <div
        className={`rounded-2xl p-10 text-center border max-w-lg mx-auto ${
          isDarkMode
            ? "bg-rose-950/20 border-rose-800/40"
            : "bg-rose-50 border-rose-200"
        }`}
      >
        <AlertCircle
          className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? "text-rose-400" : "text-rose-600"
          }`}
        />
        <h3
          className={`text-xl font-bold mb-2 ${
            isDarkMode ? "text-rose-300" : "text-rose-800"
          }`}
        >
          {isError ? "Failed to load data" : "No outstanding items found"}
        </h3>
        <button
          onClick={refetch}
          className="mt-5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 mx-auto transition-colors"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* ── Hover Popup ── */}
      {hoveredItem && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            left: Math.min(hoverPos.x, window.innerWidth - 420) + "px",
            top: hoverPos.y + 8 + "px",
          }}
        >
          <div className="bg-white border border-indigo-100 rounded-2xl shadow-2xl w-[400px] p-5 text-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-base">
                {hoveredItem.siteName}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  hoveredItem.balance > 0
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {hoveredItem.balance > 0 ? "Pending" : "Advance"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                ["Date", hoveredItem.date],
                ["Bill Date", hoveredItem.billDate],
                ["Vendor / Party", hoveredItem.vendorName],
                ["Expense Head", hoveredItem.expHead],
                ["Bill Number", hoveredItem.billNo],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                    {label}
                  </p>
                  <p className="text-gray-800 font-medium break-words leading-tight mt-0.5">
                    {val || "—"}
                  </p>
                </div>
              ))}
            </div>
            {hoveredItem.billPDF && (
              <div className="mt-3">
                <a
                  href={hoveredItem.billPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium"
                >
                  📄 View Bill PDF
                </a>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3">
              {[
                ["Net Amount", hoveredItem.netAmount, "text-gray-700"],
                ["Paid", hoveredItem.paidAmount, "text-emerald-700 font-bold"],
                [
                  "Balance",
                  hoveredItem.balance,
                  hoveredItem.balance > 0 ? "text-rose-600" : "text-emerald-600",
                  true,
                ],
              ].map(([label, val, cls, abs]) => (
                <div key={label} className="bg-gray-50 rounded-lg px-2.5 py-2">
                  <p className="text-[9px] uppercase text-gray-400 font-semibold">
                    {label}
                  </p>
                  <p className={`text-sm mt-0.5 font-bold ${cls}`}>
                    ₹
                    {(abs ? Math.abs(val) : val).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
        {[
          {
            label: "Total Billed",
            value: totalNet,
            dark: "from-rose-950/40 to-rose-900/30 border-rose-800/50",
            light: "from-rose-50 to-rose-100 border-rose-200",
            textDark: "text-rose-300",
            textLight: "text-rose-700",
            valDark: "text-rose-400",
            valLight: "text-rose-700",
          },
          {
            label: "Total Paid",
            value: totalPaid,
            dark: "from-emerald-950/40 to-emerald-900/30 border-emerald-800/50",
            light: "from-emerald-50 to-emerald-100 border-emerald-200",
            textDark: "text-emerald-300",
            textLight: "text-emerald-700",
            valDark: "text-emerald-400",
            valLight: "text-emerald-700",
          },
          {
            label: "Outstanding",
            value: Math.abs(totalOutstanding),
            dark: "from-indigo-950/40 to-purple-950/30 border-indigo-800/50",
            light: "from-indigo-50 to-purple-100 border-indigo-200",
            textDark: "text-indigo-300",
            textLight: "text-indigo-700",
            valDark: totalOutstanding >= 0 ? "text-rose-500" : "text-emerald-500",
            valLight: totalOutstanding >= 0 ? "text-rose-500" : "text-emerald-500",
          },
        ].map(({ label, value, dark, light, textDark, textLight, valDark, valLight }) => (
          <div
            key={label}
            className={`rounded-xl border shadow-lg p-6 text-center transition-all hover:shadow-xl bg-gradient-to-br ${
              isDarkMode ? dark : light
            }`}
          >
            <p
              className={`text-sm font-medium uppercase tracking-wide mb-2 ${
                isDarkMode ? textDark : textLight
              }`}
            >
              {label}
            </p>
            <p
              className={`text-3xl lg:text-4xl font-black ${
                isDarkMode ? valDark : valLight
              }`}
            >
              ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div
        className={`rounded-xl border shadow-lg p-6 lg:p-8 ${
          isDarkMode
            ? "bg-gray-900/40 border-gray-700/60"
            : "bg-white border-gray-200/80"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3
            className={`text-xl lg:text-2xl font-bold flex items-center gap-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Search
              className={`w-6 h-6 ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            />
            Filter Pending Dues
            {activeFiltersCount > 0 && (
              <span
                className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${
                  isDarkMode
                    ? "bg-indigo-900/80 text-indigo-200"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {activeFiltersCount} active
              </span>
            )}
          </h3>
          {activeFiltersCount > 0 && (
            <button
              onClick={() =>
                setFilters({
                  siteNames: [],
                  vendorNames: [],
                  expHeads: [],
                  billNos: [],
                })
              }
              className={`px-5 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-rose-950/30 text-rose-400 hover:border-rose-600"
                  : "border-gray-300 hover:bg-rose-50 text-rose-600 hover:border-rose-400"
              }`}
            >
              <X size={16} /> Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          <MultiSelectFilter
            label="Site Name"
            value={filters.siteNames}
            onChange={(vals) =>
              setFilters({ siteNames: vals, vendorNames: [], expHeads: [], billNos: [] })
            }
            options={filterOptions.siteNames}
            placeholder="Search & select sites..."
            isDarkMode={isDarkMode}
          />
          <MultiSelectFilter
            label="Vendor / Party"
            value={filters.vendorNames}
            onChange={(vals) =>
              setFilters((p) => ({ ...p, vendorNames: vals, expHeads: [], billNos: [] }))
            }
            options={filterOptions.vendorNames}
            placeholder="Search & select vendors..."
            isDarkMode={isDarkMode}
          />
          <MultiSelectFilter
            label="Expense Head"
            value={filters.expHeads}
            onChange={(vals) =>
              setFilters((p) => ({ ...p, expHeads: vals, billNos: [] }))
            }
            options={filterOptions.expHeads}
            placeholder="Search & select heads..."
            isDarkMode={isDarkMode}
          />
          <MultiSelectFilter
            label="Bill Number"
            value={filters.billNos}
            onChange={(vals) =>
              setFilters((p) => ({ ...p, billNos: vals }))
            }
            options={filterOptions.billNos}
            placeholder="Search & select bills..."
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className={`rounded-xl border shadow-lg overflow-hidden ${
          isDarkMode
            ? "bg-gray-900/30 border-gray-700/50"
            : "bg-white border-gray-200/70"
        }`}
      >
        <div
          className={`px-6 py-5 border-b font-semibold text-lg flex items-center justify-between ${
            isDarkMode
              ? "bg-gradient-to-r from-indigo-950/70 to-purple-950/50 text-indigo-200 border-gray-700/60"
              : "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 border-indigo-200/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle
              className={`w-6 h-6 ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            />
            Pending Payments
          </div>
          <span className="text-sm font-medium opacity-90">
            Showing {displayedData.length} of {filteredData.length} records
          </span>
        </div>

        {filteredData.length === 0 ? (
          <div className="py-16 text-center">
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No matching records found
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead
                  className={
                    isDarkMode ? "bg-gray-800/40" : "bg-gray-100/80"
                  }
                >
                  <tr>
                    {[
                      "Date","Site","Vendor","Exp. Head",
                      "Bill No","Bill Date","Bill PDF",
                      "Net Amt","Paid","Balance",
                    ].map((col, i) => (
                      <th
                        key={col}
                        className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${
                          i >= 7 ? "text-right" : "text-left"
                        } ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? "divide-gray-800/40" : "divide-gray-200/40"
                  }`}
                >
                  {displayedData.map((item, index) => (
                    <tr
                      key={index}
                      className={`transition-colors cursor-default ${
                        isDarkMode
                          ? "hover:bg-indigo-950/30"
                          : "hover:bg-indigo-50/40"
                      } ${
                        index % 2 !== 0
                          ? isDarkMode
                            ? "bg-gray-800/10"
                            : "bg-gray-50/60"
                          : ""
                      }`}
                      onMouseEnter={(e) => {
                        clearTimeout(hoverTimerRef.current);
                        hoverTimerRef.current = setTimeout(() => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoverPos({
                            x: rect.left + window.scrollX,
                            y: rect.bottom + window.scrollY,
                          });
                          setHoveredItem(item);
                        }, 300);
                      }}
                      onMouseLeave={() => {
                        clearTimeout(hoverTimerRef.current);
                        setHoveredItem(null);
                      }}
                    >
                      <td className={`px-5 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{item.date}</td>
                      <td title={item.siteName} className={`px-5 py-4 text-sm font-medium max-w-[180px] truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{item.siteName}</td>
                      <td title={item.vendorName} className={`px-5 py-4 text-sm font-medium max-w-[180px] truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{item.vendorName}</td>
                      <td title={item.expHead} className={`px-5 py-4 text-sm max-w-[140px] truncate ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{item.expHead}</td>
                      <td title={item.billNo} className={`px-5 py-4 text-sm max-w-[120px] truncate ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{item.billNo}</td>
                      <td className={`px-5 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{item.billDate}</td>
                      <td className="px-5 py-4 text-center">
                        {item.billPDF ? (
                          <a href={item.billPDF} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 text-lg" title="View PDF">📄</a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className={`px-5 py-4 text-right text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>₹{item.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className={`px-5 py-4 text-right text-sm font-medium ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>₹{item.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className={`px-5 py-4 text-right text-lg font-bold ${item.balance > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                        ₹{Math.abs(item.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        {item.balance < 0 && <span className="text-xs ml-1 opacity-70">(adv)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length > 10 && (
              <div className={`px-6 py-5 border-t text-center ${isDarkMode ? "bg-gray-900/30 border-gray-700/50" : "bg-gray-50 border-gray-200"}`}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-8 py-3 rounded-xl font-medium transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {showAll ? "Show Top 10 Only" : `Show All ${filteredData.length} Records`}
                </button>
              </div>
            )}
          </>
        )}

        <div className={`px-6 py-5 border-t font-bold text-right text-lg flex justify-between items-center ${isDarkMode ? "bg-gray-900/40 border-gray-700/60 text-indigo-300" : "bg-gray-50 border-gray-200 text-indigo-800"}`}>
          <span>Total Outstanding (filtered):</span>
          <span className={totalOutstanding >= 0 ? "text-rose-500" : "text-emerald-500"}>
            ₹{Math.abs(totalOutstanding).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN SUMMARY COMPONENT
// ─────────────────────────────────────────────
const Summary = () => {
  const isDarkMode = localStorage.getItem("isDarkMode") === "true";
  const [activeTab, setActiveTab] = useState("summary");
  const [period, setPeriod] = useState("all");
  const [filters, setFilters] = useState({
    siteNames: [],
    bankNames: [],
    vendorNames: [],
    expHeads: [],
  });

  const currentDate = new Date();
  const { data: apiData, isLoading, isError, error, refetch } =
    useGetMainBankSummaryQuery();

  const processedTransactions = useMemo(() => {
    const transactions = apiData?.transactions || [];
    if (!Array.isArray(transactions)) return [];
    return transactions
      .map((t) => {
        const inAmt = parseAmount(t.inAmount);
        const outAmt = parseAmount(t.outAmount);
        return {
          ...t,
          date: parseDate(t.date),
          amount: inAmt > 0 ? inAmt : outAmt,
          type: inAmt > 0 ? "in" : "out",
          category: t.expHead || t.siteName || "General",
          vendorName: t.vendorName || t.partyName || "",
        };
      })
      .filter((t) => t.date !== null && !isNaN(t.date?.getTime()));
  }, [apiData]);

  const allUniqueOptions = useMemo(
    () => ({
      siteNames: ["All", ...getUniqueIgnoreCase(processedTransactions.map((t) => t.siteName || ""))],
      bankNames: ["All", ...getUniqueIgnoreCase(processedTransactions.map((t) => t.bankName || ""))],
      vendorNames: ["All", ...getUniqueIgnoreCase(processedTransactions.map((t) => t.vendorName || ""))],
      expHeads: ["All", ...getUniqueIgnoreCase(processedTransactions.map((t) => t.category || ""))],
    }),
    [processedTransactions]
  );

  const cascadingOptions = useMemo(() => {
    let data = processedTransactions;
    if (filters.siteNames.length > 0 && !filters.siteNames.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.siteName, filters.siteNames));
    const bankNames = ["All", ...getUniqueIgnoreCase(data.map((t) => t.bankName || ""))];
    if (filters.bankNames.length > 0 && !filters.bankNames.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.bankName, filters.bankNames));
    const vendorNames = ["All", ...getUniqueIgnoreCase(data.map((t) => t.vendorName || ""))];
    if (filters.vendorNames.length > 0 && !filters.vendorNames.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.vendorName, filters.vendorNames));
    const expHeads = ["All", ...getUniqueIgnoreCase(data.map((t) => t.category || ""))];
    return { siteNames: allUniqueOptions.siteNames, bankNames, vendorNames, expHeads };
  }, [processedTransactions, filters, allUniqueOptions.siteNames]);

  const finalFilteredData = useMemo(() => {
    let data = processedTransactions;
    let startDate = new Date(0);
    switch (period) {
      case "1w": startDate = new Date(currentDate); startDate.setDate(currentDate.getDate() - 7); break;
      case "2w": startDate = new Date(currentDate); startDate.setDate(currentDate.getDate() - 14); break;
      case "1m": startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); break;
      case "3m": startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1); break;
      case "6m": startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1); break;
      case "1y": startDate = new Date(currentDate.getFullYear() - 1, 0, 1); break;
      default: startDate = new Date(0);
    }
    startDate.setHours(0, 0, 0, 0);
    data = data.filter((t) => t.date >= startDate);
    if (filters.siteNames.length > 0 && !filters.siteNames.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.siteName, filters.siteNames));
    if (filters.bankNames.length > 0 && !filters.bankNames.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.bankName, filters.bankNames));
    if (filters.vendorNames.length > 0 && !filters.vendorNames.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.vendorName, filters.vendorNames));
    if (filters.expHeads.length > 0 && !filters.expHeads.includes("All"))
      data = data.filter((t) => matchesIgnoreCase(t.category, filters.expHeads));
    return data;
  }, [processedTransactions, period, filters]);

  const totalIn = useMemo(
    () => finalFilteredData.filter((t) => t.type === "in").reduce((sum, t) => sum + t.amount, 0),
    [finalFilteredData]
  );
  const totalOut = useMemo(
    () => finalFilteredData.filter((t) => t.type === "out").reduce((sum, t) => sum + t.amount, 0),
    [finalFilteredData]
  );
  const balance = totalIn - totalOut;

  const pieData = {
    labels: ["Income", "Expense"],
    datasets: [{
      data: [totalIn, Math.abs(totalOut)],
      backgroundColor: ["#10b981", "#f43f5e"],
      hoverOffset: 12,
      borderWidth: 0,
    }],
  };

  const barChartData = useMemo(() => {
    if (finalFilteredData.length === 0) return { labels: [], datasets: [] };
    const monthlyData = {};
    finalFilteredData.forEach((t) => {
      if (!t.date) return;
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      const displayLabel = t.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      monthlyData[key] = monthlyData[key] || { income: 0, expense: 0, display: displayLabel };
      if (t.type === "in") monthlyData[key].income += t.amount;
      else monthlyData[key].expense += t.amount;
    });
    const sortedKeys = Object.keys(monthlyData).sort();
    return {
      labels: sortedKeys.map((k) => monthlyData[k].display),
      datasets: [
        { label: "Income", data: sortedKeys.map((k) => monthlyData[k].income), backgroundColor: "rgba(16,185,129,0.75)", borderColor: "#10b981", borderWidth: 1, borderRadius: 8 },
        { label: "Expense", data: sortedKeys.map((k) => monthlyData[k].expense), backgroundColor: "rgba(244,63,94,0.75)", borderColor: "#f43f5e", borderWidth: 1, borderRadius: 8 },
      ],
    };
  }, [finalFilteredData]);

  const activeFiltersCount =
    filters.siteNames.length + filters.bankNames.length +
    filters.vendorNames.length + filters.expHeads.length;

  if (isLoading)
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>Loading financial data...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
        <div className={`rounded-2xl border p-8 max-w-md text-center ${isDarkMode ? "bg-red-900/30 border-red-700/40" : "bg-red-50/80 border-red-200"}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>Error Loading Data</h2>
          <p className={`mb-6 ${isDarkMode ? "text-red-200" : "text-red-800"}`}>{error?.data?.message || error?.message || "Failed to fetch financial summary"}</p>
          <button onClick={refetch} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw className="w-5 h-5" /> Retry
          </button>
        </div>
      </div>
    );

  if (!apiData)
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
        <div className={`rounded-2xl border p-8 max-w-md text-center ${isDarkMode ? "bg-indigo-900/30 border-indigo-700/40" : "bg-indigo-50/70 border-indigo-200"}`}>
          <Wallet className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>No Data Available</h2>
          <button onClick={refetch} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw className="w-5 h-5" /> Refresh
          </button>
        </div>
      </div>
    );

  const hasNoTransactionsInPeriod = finalFilteredData.length === 0;

  return (
    <div className={`min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 xl:px-10 w-full ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { color: isDarkMode ? "bg-purple-700" : "bg-purple-300/40", pos: "-top-20 -left-20", delay: "0s" },
          { color: isDarkMode ? "bg-blue-700" : "bg-blue-300/40", pos: "top-1/4 right-0", delay: "3s" },
          { color: isDarkMode ? "bg-indigo-800" : "bg-indigo-300/40", pos: "-bottom-32 left-1/3", delay: "6s" },
        ].map(({ color, pos, delay }, i) => (
          <div key={i} className={`absolute ${pos} w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow ${color}`} style={{ animationDelay: delay }} />
        ))}
      </div>

      {/* Floating Dots */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isDarkMode ? "bg-white opacity-15" : "bg-indigo-500 opacity-25"}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full space-y-8 lg:space-y-10">
        {/* ── Header Card ── */}
        <div className={`rounded-2xl border shadow-2xl w-full p-6 sm:p-8 lg:p-10 xl:p-12 ${isDarkMode ? "bg-black/70 border-indigo-700/60" : "bg-white/90 border-indigo-200/80"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent flex items-center gap-3 ${isDarkMode ? "from-indigo-200 via-purple-200 to-indigo-200" : "from-indigo-700 via-purple-700 to-indigo-700"}`}>
                <Wallet className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                Financial Dashboard
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? "text-indigo-300/80" : "text-indigo-700/80"}`}>
                Complete overview of your finances
              </p>
            </div>
            <button onClick={refetch} className={`px-4 py-2.5 border rounded-xl transition-all flex items-center gap-2 ${isDarkMode ? "bg-black/50 border-indigo-600/50 hover:bg-white/10 text-white" : "bg-white/60 border-indigo-300/60 hover:bg-gray-100 text-gray-800"}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-8">
            <div className={`border-2 p-1.5 rounded-xl shadow-lg inline-flex flex-wrap gap-1 ${isDarkMode ? "bg-black/50 border-indigo-600/50" : "bg-white/60 border-indigo-300/60"}`}>
              {[
                { key: "summary", label: "Summary", icon: <ListOrdered className="w-5 h-5" /> },
                { key: "bankBalance", label: "Bank Balance", icon: <Building2 className="w-5 h-5" /> },
                { key: "Accrual Accounting", label: "Accrual Accounting", icon: <AlertCircle className="w-5 h-5" /> },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-3 rounded-lg text-base font-semibold transition-all flex items-center gap-2 ${activeTab === key ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : isDarkMode ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Period + Filters (Summary Tab Only) ── */}
          {activeTab === "summary" && (
            <>
              <div className="mt-8">
                <div className={`border p-1.5 rounded-xl shadow-lg flex flex-wrap ${isDarkMode ? "bg-black/50 border-indigo-600/50" : "bg-white/60 border-indigo-300/60"}`}>
                  {["all", "1y", "6m", "3m", "1m", "2w", "1w"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${period === p ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : isDarkMode ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      {p === "all" ? "All Time" : p.replace(/(\d)([a-z])/gi, "$1 $2").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-6 relative z-[100]">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    <Search className="w-5 h-5" /> Filter Data
                    {activeFiltersCount > 0 && (
                      <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${isDarkMode ? "bg-indigo-900/60 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                        {activeFiltersCount} active
                      </span>
                    )}
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => setFilters({ siteNames: [], bankNames: [], vendorNames: [], expHeads: [] })}
                      className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 text-sm font-semibold ${isDarkMode ? "bg-gray-900/60 border-gray-700 hover:border-red-500 text-red-400 hover:bg-red-900/20" : "bg-white border-gray-300 hover:border-red-400 text-red-600 hover:bg-red-50"}`}
                    >
                      <X className="w-4 h-4" /> Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <MultiSelectFilter label="Site Name" value={filters.siteNames} onChange={(vals) => setFilters((p) => ({ ...p, siteNames: vals, bankNames: [], vendorNames: [], expHeads: [] }))} options={cascadingOptions.siteNames} placeholder="Search & select sites..." isDarkMode={isDarkMode} />
                  <MultiSelectFilter label="Bank Name" value={filters.bankNames} onChange={(vals) => setFilters((p) => ({ ...p, bankNames: vals, vendorNames: [], expHeads: [] }))} options={cascadingOptions.bankNames} placeholder="Search & select banks..." isDarkMode={isDarkMode} />
                  <MultiSelectFilter label="Vendor Name" value={filters.vendorNames} onChange={(vals) => setFilters((p) => ({ ...p, vendorNames: vals, expHeads: [] }))} options={cascadingOptions.vendorNames} placeholder="Search & select vendors..." isDarkMode={isDarkMode} />
                  <MultiSelectFilter label="Expense Head" value={filters.expHeads} onChange={(vals) => setFilters((p) => ({ ...p, expHeads: vals }))} options={cascadingOptions.expHeads} placeholder="Search & select heads..." isDarkMode={isDarkMode} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Summary Tab Content ── */}
        {activeTab === "summary" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
              <StatCard title="Total Income" amount={totalIn} color="emerald" icon={<ArrowDownCircle />} isDarkMode={isDarkMode} />
              <StatCard title="Total Expenses" amount={Math.abs(totalOut)} color="rose" icon={<ArrowUpCircle />} isDarkMode={isDarkMode} />
              <StatCard title="Net Balance" amount={balance} color={balance >= 0 ? "emerald" : "rose"} icon={<Wallet />} isBalance isDarkMode={isDarkMode} balanceValue={balance} />
            </div>

            {hasNoTransactionsInPeriod && (
              <div className={`rounded-2xl border p-6 text-center ${isDarkMode ? "bg-yellow-900/30 border-yellow-700/40" : "bg-yellow-50/70 border-yellow-300/60"}`}>
                <p className={`text-lg ${isDarkMode ? "text-yellow-300" : "text-yellow-800"}`}>No transactions found for the selected period and filters</p>
                <button onClick={() => { setPeriod("all"); setFilters({ siteNames: [], bankNames: [], vendorNames: [], expHeads: [] }); }} className="mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                  Reset All
                </button>
              </div>
            )}

            {finalFilteredData.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
                  {/* Bar Chart */}
                  <div className={`lg:col-span-2 rounded-2xl border shadow-2xl p-6 md:p-8 lg:p-10 w-full ${isDarkMode ? "bg-black/30 border-indigo-700/40" : "bg-white/70 border-indigo-200/60"}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3 className={`text-2xl lg:text-3xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        <Calendar className={`w-7 h-7 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} /> Transaction Trend
                      </h3>
                      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100/70 text-indigo-700"}`}>
                        {period === "all" ? "All Time" : `Last ${period.replace(/(\d)([a-z])/gi, "$1 $2")}`}
                      </span>
                    </div>
                    <div className="h-[420px] lg:h-[480px] w-full">
                      <Bar data={barChartData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: "top", labels: { color: isDarkMode ? "#e5e7eb" : "#374151", font: { size: 14, weight: "bold" }, padding: 20, usePointStyle: true } }, tooltip: { backgroundColor: isDarkMode ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)", titleColor: isDarkMode ? "#e5e7eb" : "#111827", bodyColor: isDarkMode ? "#e5e7eb" : "#111827", cornerRadius: 10, padding: 12, callbacks: { label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString("en-IN")}` } } }, scales: { y: { beginAtZero: true, grid: { color: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }, ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280", font: { weight: "600" }, callback: (v) => "₹" + v.toLocaleString("en-IN") } }, x: { grid: { display: false }, ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280", font: { weight: "600" } } } } }} />
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className={`rounded-2xl border shadow-2xl p-6 md:p-8 lg:p-10 w-full ${isDarkMode ? "bg-black/30 border-indigo-700/40" : "bg-white/70 border-indigo-200/60"}`}>
                    <h3 className={`text-2xl lg:text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Income vs Expenses</h3>
                    <div className="h-72 lg:h-80 flex items-center justify-center w-full">
                      <Pie data={pieData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: "bottom", labels: { color: isDarkMode ? "#e5e7eb" : "#374151", font: { weight: "bold", size: 14 }, padding: 20, usePointStyle: true } }, tooltip: { backgroundColor: isDarkMode ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)", titleColor: isDarkMode ? "#e5e7eb" : "#111827", bodyColor: isDarkMode ? "#e5e7eb" : "#111827", padding: 12, cornerRadius: 10, callbacks: { label: (ctx) => `${ctx.label}: ₹${ctx.parsed.toLocaleString("en-IN")}` } } } }} />
                    </div>
                    <div className={`mt-6 pt-6 border-t text-center ${isDarkMode ? "border-indigo-700/30" : "border-indigo-200/30"}`}>
                      <p className={`text-sm uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Savings Rate</p>
                      <p className={`text-3xl lg:text-4xl font-bold ${balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {totalIn > 0 ? ((balance / totalIn) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className={`rounded-2xl border overflow-hidden shadow-2xl w-full ${isDarkMode ? "bg-black/30 border-indigo-700/40" : "bg-white/70 border-indigo-200/60"}`}>
                  <div className={`p-6 md:p-8 lg:p-10 border-b ${isDarkMode ? "bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-700/40" : "bg-gradient-to-r from-indigo-100/70 to-purple-100/70 border-indigo-200/40"}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className={`text-2xl lg:text-3xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        <ListOrdered className={`w-7 h-7 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} /> Recent Transactions
                      </h3>
                      <span className={`px-5 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100/70 text-indigo-700"}`}>
                        {finalFilteredData.length} Records
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[1000px]">
                      <thead className={isDarkMode ? "bg-black/50" : "bg-gray-100/80"}>
                        <tr>
                          {["Date", "Site Name", "Vendor", "Category", "Type", "Amount"].map((col, i) => (
                            <th key={col} className={`px-6 py-4 text-sm font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : ""} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? "divide-gray-800/50" : "divide-gray-200/50"}`}>
                        {finalFilteredData.slice(0, 10).map((t, i) => (
                          <tr key={i} className={`transition-colors ${isDarkMode ? "hover:bg-indigo-950/30" : "hover:bg-indigo-50/30"}`}>
                            <td className={`px-6 py-5 text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td className={`px-6 py-5 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.siteName || "-"}</td>
                            <td className={`px-6 py-5 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.vendorName || "-"}</td>
                            <td className="px-6 py-5"><span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? "bg-gray-800/70 text-gray-200" : "bg-gray-200/70 text-gray-800"}`}>{t.category}</span></td>
                            <td className="px-6 py-5"><span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${t.type === "in" ? isDarkMode ? "bg-emerald-900/50 text-emerald-300 border-emerald-700/40" : "bg-emerald-100/70 text-emerald-800 border-emerald-300/60" : isDarkMode ? "bg-rose-900/50 text-rose-300 border-rose-700/40" : "bg-rose-100/70 text-rose-800 border-rose-300/60"}`}>{t.type === "in" ? "↓ Income" : "↑ Expense"}</span></td>
                            <td className={`px-6 py-5 text-right text-lg font-bold ${t.type === "in" ? "text-emerald-500" : "text-rose-500"}`}>{t.type === "in" ? "+" : "-"} ₹{t.amount.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {finalFilteredData.length > 10 && (
                    <div className={`p-6 border-t text-center ${isDarkMode ? "bg-black/40 border-indigo-700/30" : "bg-gray-50/70 border-indigo-200/30"}`}>
                      <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all shadow-lg">
                        View All Transactions
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "bankBalance" && <BankBalance isDarkMode={isDarkMode} />}
        {activeTab === "Accrual Accounting" && <Outstanding isDarkMode={isDarkMode} />}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -60px); }
        }
        .animate-pulse-slow { animation: pulse 18s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.1); }
        }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? "rgba(17,24,39,0.5)" : "rgba(243,244,246,0.5)"}; border-radius: 5px; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.3)"}; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? "rgba(99,102,241,0.7)" : "rgba(99,102,241,0.5)"}; }
      `}</style>
    </div>
  );
};

export default Summary;