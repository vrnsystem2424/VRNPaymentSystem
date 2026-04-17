

// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   Calendar, Search, AlertCircle,
//   Edit3, X, Loader2, MessageSquare,
//   Filter, ChevronLeft, ChevronRight, Eye,
//   Clock, CheckCircle2, AlertTriangle, IndianRupee, Phone, Mail, MapPin,
//   Percent, TrendingUp, DollarSign, ArrowDownLeft, FileText
// } from 'lucide-react';

// import {
//   useGetSchedulePaymentsQuery,
//   useUpdateSchedulePaymentMutation,
//   useGetProjectBankMappingQuery
// } from '../../features/SchedulePayment/SchedulePaymentSlice';

// /* ─── Helper Components ─── */
// const StatPill = ({ label, value, color }) => {
//   const colors = {
//     blue: 'bg-blue-50 text-blue-700 border border-blue-200',
//     green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
//     amber: 'bg-amber-50 text-amber-700 border border-amber-200',
//     red: 'bg-red-50 text-red-700 border border-red-200',
//   };
//   return (
//     <div className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${colors[color]}`}>
//       <span className="opacity-70">{label}</span>
//       <span className="text-lg font-black">{value}</span>
//     </div>
//   );
// };

// const InfoCell = ({ label, value, highlight }) => (
//   <div>
//     <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
//     <p className={`font-semibold text-sm break-words ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>{value || '—'}</p>
//   </div>
// );

// const FormField = ({ label, required, children, className }) => (
//   <div className={className}>
//     <label className="block text-sm font-semibold text-slate-700 mb-1.5">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     {children}
//   </div>
// );

// const StatusChip = ({ status }) => {
//   const map = {
//     completed: { cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: '✓ Completed' },
//     partial: { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: '◑ Partial' },
//     pending: { cls: 'bg-red-100 text-red-700 border border-red-200', label: '⏳ Pending' },
//   };
//   const s = map[status] || { cls: 'bg-slate-100 text-slate-600', label: status || '—' };
//   return (
//     <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>
//   );
// };

// /* ─── Main Component ─── */
// const SchedulePayment = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterProject, setFilterProject] = useState('');
//   const [filterOverdue, setFilterOverdue] = useState(false);
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 15;

//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);

//   const [showActionModal, setShowActionModal] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [selectedBookingForAction, setSelectedBookingForAction] = useState(null);
//   const [actionForm, setActionForm] = useState({
//     status: '', remark: '', amountReceived: '', nextDate: '',
//     lastDateOfReceiving: '', bankName: '', paymentMode: '', paymentDetails: '',
//     gstPercent: '0', tdsAmount: '0'
//   });

//   const { data: payments = [], isLoading, isFetching, isError, error } = useGetSchedulePaymentsQuery();
//   const [updateSchedulePayment, { isLoading: isUpdating }] = useUpdateSchedulePaymentMutation();
//   const { data: bankMapping, isLoading: banksLoading } = useGetProjectBankMappingQuery(undefined, { refetchOnMountOrArgChange: true });

//   const userType = sessionStorage.getItem('userType') || '';
//   const isCRM = userType.trim().toUpperCase() === 'CRM';

//   const isRefundStatus = (s) => s === 'refund';
//   const isWorkNotDoneStatus = (s) => s === 'worknotdone';
//   const isPaymentStatus = (s) => ['Done', 'partial', 'refund', 'worknotdone'].includes(s);

//   const gstCalculation = useMemo(() => {
//     const amount = parseFloat(actionForm.amountReceived) || 0;
//     const tds = isWorkNotDoneStatus(actionForm.status) ? (parseFloat(actionForm.tdsAmount) || 0) : 0;
//     const gstPercent = parseFloat(actionForm.gstPercent) || 0;
//     const grossAmount = amount + tds;

//     if (grossAmount <= 0) {
//       return { cgst: 0, sgst: 0, totalGst: 0, netAmount: 0, tds: 0, grossAmount: 0 };
//     }

//     if (gstPercent <= 0) {
//       return { cgst: 0, sgst: 0, totalGst: 0, netAmount: grossAmount, tds, grossAmount };
//     }

//     const netAmount = grossAmount / (1 + gstPercent / 100);
//     const totalGst = grossAmount - netAmount;
//     const cgst = totalGst / 2;
//     const sgst = totalGst / 2;

//     return {
//       cgst: Math.round(cgst * 100) / 100,
//       sgst: Math.round(sgst * 100) / 100,
//       totalGst: Math.round(totalGst * 100) / 100,
//       netAmount: Math.round(netAmount * 100) / 100,
//       tds,
//       grossAmount: Math.round(grossAmount * 100) / 100
//     };
//   }, [actionForm.amountReceived, actionForm.gstPercent, actionForm.tdsAmount, actionForm.status]);

//   const formatDate = (dateStr, forDisplay = false) => {
//     const fallback = forDisplay ? '—' : '';
//     if (!dateStr || dateStr === '—' || dateStr === '-') return fallback;
//     const s = String(dateStr).trim();
//     if (!s) return fallback;
//     if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s;
//     if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
//       const [y, m, d] = s.split('-');
//       return `${d}/${m}/${y}`;
//     }
//     if (/^\d{4}\/\d{2}\/\d{2}/.test(s)) {
//       const [y, m, d] = s.split('/');
//       return `${d}/${m}/${y}`;
//     }
//     return fallback;
//   };

//   const formatCurrency = (amount) => {
//     if (amount == null || isNaN(amount)) return '₹0';
//     return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   };

//   const formatCurrencyShort = (amount) => {
//     if (amount == null || isNaN(amount)) return '₹0';
//     return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
//   };

//   const stripNum = (str) => Number(String(str || '').replace(/[^0-9.-]/g, '') || 0);

//   const parseToDate = (dateStr) => {
//     if (!dateStr || dateStr === '—' || dateStr === '-') return null;
//     let d;
//     if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
//       const [dd, mm, yyyy] = dateStr.split('/');
//       d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//     } else if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
//       const [yyyy, mm, dd] = dateStr.split('-');
//       d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//     } else {
//       d = new Date(dateStr);
//     }
//     return isNaN(d?.getTime()) ? null : d;
//   };

//   const isOverdue = (dateStr) => {
//     const d = parseToDate(dateStr);
//     if (!d) return false;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return d < today;
//   };

//   const isRefundPayment = (pay) => {
//     const s = (pay?.status || '').toLowerCase().trim();
//     const sAC = (pay?.statusAC || '').toLowerCase().trim();
//     return s === 'refund' || s === 'refund payment' || sAC === 'refund' || sAC === 'refund payment';
//   };

//   const isWorkNotDonePayment = (pay) => {
//     const s = (pay?.status || '').toLowerCase().trim();
//     const sAC = (pay?.statusAC || '').toLowerCase().trim();
//     return s === 'worknotdone' || s === 'work not done' || sAC === 'worknotdone' || sAC === 'work not done';
//   };

//   // ─── FIX #1: Use grossAmount for received calculation ───
//   // Backend sends: PreviousAmount = net amount (after GST), grossAmount = actual amount received
//   // Schedule Amount is gross, so we must compare gross vs gross
//   const getPaymentGrossAmount = (pay) => {
//     // First try grossAmount (AB column — the actual amount paid/received)
//     const gross = parseFloat(pay?.grossAmount);
//     if (!isNaN(gross) && gross > 0) return gross;

//     // Fallback: try PreviousAmount and other fields (for older records without grossAmount)
//     for (const key of ['PreviousAmountV', 'PreviousAmount', 'amount', 'Amount', 'previousAmount', 'receivedAmount', 'amountReceived', 'paymentAmount', 'PreviousReceivedAmount']) {
//       const val = pay?.[key];
//       if (val != null && val !== '' && !isNaN(Number(val))) return Number(val);
//     }
//     return 0;
//   };

//   // Keep original for net amount display purposes
//   const getPreviousAmount = (pay) => {
//     for (const key of ['PreviousAmountV', 'PreviousAmount', 'amount', 'Amount', 'previousAmount', 'receivedAmount', 'amountReceived', 'paymentAmount', 'PreviousReceivedAmount']) {
//       const val = pay?.[key];
//       if (val != null && val !== '' && !isNaN(Number(val))) return Number(val);
//     }
//     return 0;
//   };

//   const getLatestFollowUpInfo = (schedule) => {
//     if (!schedule?.followUpHistory?.length) return { nextDate: schedule?.FollowUp || '—', count: '—', lastRemark: '—', lastStatus: '—' };
//     const sorted = [...schedule.followUpHistory].sort((a, b) => new Date(b.timestamp || b.dateOfFollowup || 0) - new Date(a.timestamp || a.dateOfFollowup || 0));
//     const latest = sorted[0];
//     return { nextDate: latest.nextDateOfFollowup || schedule.FollowUp || '—', count: latest.followupCount || schedule.followUpHistory.length || '—', lastRemark: latest.remark || '—', lastStatus: latest.status || '—' };
//   };

//   const getNextFollowUpForBooking = (booking) => {
//     let nextDate = '—'; let count = '—';
//     for (const schedule of booking.schedules) {
//       if (schedule.previousPayments?.length > 0) {
//         const sortedPayments = [...schedule.previousPayments].sort((a, b) => {
//           const dateA = parseToDate(a.previousReceviedAmountDate)?.getTime() || new Date(a.timestamp || 0).getTime();
//           const dateB = parseToDate(b.previousReceviedAmountDate)?.getTime() || new Date(b.timestamp || 0).getTime();
//           return dateB - dateA;
//         });
//         for (const payment of sortedPayments) {
//           for (const field of ['NextDate', 'nextDate', 'next_date', 'nextFollowupDate']) {
//             if (payment[field] && payment[field] !== '—' && payment[field] !== '-' && payment[field] !== '') {
//               const fd = formatDate(payment[field], true);
//               if (fd && fd !== '—') { nextDate = fd; count = sortedPayments.length; break; }
//             }
//           }
//           if (nextDate !== '—') break;
//         }
//       }
//       if (nextDate !== '—') break;
//       if (schedule.followUpHistory?.length > 0) {
//         const sorted = [...schedule.followUpHistory].sort((a, b) => new Date(b.timestamp || b.dateOfFollowup || 0) - new Date(a.timestamp || a.dateOfFollowup || 0));
//         for (const fu of sorted) {
//           if (fu.nextDateOfFollowup && fu.nextDateOfFollowup !== '—' && fu.nextDateOfFollowup !== '-' && fu.nextDateOfFollowup !== '') {
//             const fd = formatDate(fu.nextDateOfFollowup, true);
//             if (fd && fd !== '—') { nextDate = fd; count = fu.followupCount || sorted.length; break; }
//           }
//         }
//       }
//       if (nextDate !== '—') break;
//       for (const field of ['NextDate', 'nextDate', 'nextDateOfFollowup', 'next_date', 'nextFollowupDate']) {
//         if (schedule[field] && schedule[field] !== '—' && schedule[field] !== '-' && schedule[field] !== '' && schedule[field].toUpperCase() !== 'Y' && schedule[field].toUpperCase() !== 'N') {
//           const fd = formatDate(schedule[field], true);
//           if (fd && fd !== '—') { nextDate = fd; break; }
//         }
//       }
//       if (nextDate !== '—') break;
//     }
//     return { nextDate, count };
//   };

//   // ─── FIX #2: Use grossAmount for schedule received total ───
//   // This is the key fix — we use gross amount (actual payment) not net amount
//   // because schedule Amount is also gross
//   const getScheduleTotalReceived = (sch) =>
//     (sch.previousPayments || []).reduce(
//       (s, p) => isRefundPayment(p) ? s : s + getPaymentGrossAmount(p), 0
//     );

//   const getScheduleTotalRefund = (sch) =>
//     (sch.previousPayments || []).reduce(
//       (s, p) => isRefundPayment(p) ? s + getPaymentGrossAmount(p) : s, 0
//     );

//   const getScheduleBalance = (sch) => {
//     const schAmount = stripNum(sch.Amount);
//     const received = getScheduleTotalReceived(sch);
//     return Math.max(0, schAmount - received);
//   };

//   // ─── FIX #3: Schedule completion with spillover logic ───
//   // When schedule 1 is overpaid, surplus should flow to schedule 2, etc.
//   // This function calculates effective balance for each schedule considering spillover
//   const getScheduleBalancesWithSpillover = (booking) => {
//     // Sort schedules by planned date (earliest first) for sequential spillover
//     const sortedSchedules = [...booking.schedules].sort((a, b) => {
//       const dateA = parseToDate(a.Planned)?.getTime() || 0;
//       const dateB = parseToDate(b.Planned)?.getTime() || 0;
//       return dateA - dateB;
//     });

//     let carryForwardSurplus = 0;
//     const balanceMap = new Map(); // paymentId → { balance, isComplete, received, surplus }

//     for (const sch of sortedSchedules) {
//       const schAmount = stripNum(sch.Amount);
//       const directReceived = getScheduleTotalReceived(sch);
//       const totalAvailable = directReceived + carryForwardSurplus;
//       const balance = Math.max(0, schAmount - totalAvailable);
//       const surplus = Math.max(0, totalAvailable - schAmount);
//       const isComplete = balance <= 0;

//       const key = sch.paymentId || sch.Planned || JSON.stringify(sch);
//       balanceMap.set(key, {
//         balance,
//         isComplete,
//         received: directReceived,
//         effectiveReceived: Math.min(totalAvailable, schAmount),
//         surplus
//       });

//       // Carry forward any surplus to next schedule
//       carryForwardSurplus = surplus;
//     }

//     return balanceMap;
//   };

//   // Helper to get schedule key for balanceMap lookup
//   const getScheduleKey = (sch) => sch.paymentId || sch.Planned || JSON.stringify(sch);

//   const isScheduleComplete = (sch, booking) => {
//     // If booking context available, use spillover logic
//     if (booking) {
//       const balanceMap = getScheduleBalancesWithSpillover(booking);
//       const key = getScheduleKey(sch);
//       const info = balanceMap.get(key);
//       if (info) return info.isComplete;
//     }
//     // Fallback: simple check
//     return getScheduleBalance(sch) <= 0;
//   };

//   const getEffectiveScheduleBalance = (sch, booking) => {
//     if (booking) {
//       const balanceMap = getScheduleBalancesWithSpillover(booking);
//       const key = getScheduleKey(sch);
//       const info = balanceMap.get(key);
//       if (info) return info.balance;
//     }
//     return getScheduleBalance(sch);
//   };

//   const getBookingTotalReceived = (booking) => {
//     return booking.schedules.reduce((sum, sch) => sum + getScheduleTotalReceived(sch), 0);
//   };

//   const getBookingTotalRefund = (booking) =>
//     booking.schedules.reduce((sum, sch) => sum + getScheduleTotalRefund(sch), 0);

//   const getNetReceived = (booking) => {
//     const totalReceived = getBookingTotalReceived(booking);
//     const totalRefund = getBookingTotalRefund(booking);
//     return Math.max(0, totalReceived - totalRefund);
//   };

//   const getBookingTotalSurplus = (booking) => {
//     const agrValue = stripNum(booking.agreementValue);
//     const netReceived = getNetReceived(booking);
//     return Math.max(0, netReceived - agrValue);
//   };

//   const getBookingBalanceDue = (booking) => {
//     const agrValue = stripNum(booking.agreementValue);
//     const netReceived = getNetReceived(booking);
//     return Math.max(0, agrValue - netReceived);
//   };

//   const getBookingOverdueDue = (booking) => {
//     const today = new Date(); today.setHours(0, 0, 0, 0);
//     const balanceMap = getScheduleBalancesWithSpillover(booking);

//     return booking.schedules.reduce((sum, sch) => {
//       const plannedDate = parseToDate(sch.Planned);
//       const key = getScheduleKey(sch);
//       const info = balanceMap.get(key);
//       const balance = info ? info.balance : getScheduleBalance(sch);

//       if (plannedDate && plannedDate < today && balance > 0) {
//         return sum + balance;
//       }
//       return sum;
//     }, 0);
//   };

//   const getEarliestPendingPlanned = (booking) => {
//     const balanceMap = getScheduleBalancesWithSpillover(booking);

//     const pendingScheds = booking.schedules.filter(s => {
//       const key = getScheduleKey(s);
//       const info = balanceMap.get(key);
//       return info ? !info.isComplete : getScheduleBalance(s) > 0;
//     });

//     if (!pendingScheds.length) return null;
//     const sorted = pendingScheds.map(s => s.Planned).filter(Boolean)
//       .sort((a, b) => {
//         const toMs = ds => { const d = parseToDate(ds); return d ? d.getTime() : 0; };
//         return toMs(a) - toMs(b);
//       });
//     return sorted[0] || null;
//   };

//   const getBookingStatus = (booking) => {
//     const balanceMap = getScheduleBalancesWithSpillover(booking);
//     let pendingCount = 0;

//     for (const sch of booking.schedules) {
//       const key = getScheduleKey(sch);
//       const info = balanceMap.get(key);
//       const isComplete = info ? info.isComplete : getScheduleBalance(sch) <= 0;
//       if (!isComplete) pendingCount++;
//     }

//     if (pendingCount === 0) return 'completed';
//     if (pendingCount === booking.schedules.length) return 'pending';
//     return 'partial';
//   };

//   const isBookingOverdue = (booking) => {
//     if (getBookingStatus(booking) === 'completed') return false;
//     const earliestPlanned = getEarliestPendingPlanned(booking);
//     const plannedOverdue = earliestPlanned ? isOverdue(earliestPlanned) : false;
//     const fuData = getNextFollowUpForBooking(booking);
//     const nextFuOverdue = fuData.nextDate && fuData.nextDate !== '—' ? isOverdue(fuData.nextDate) : false;
//     return plannedOverdue || nextFuOverdue;
//   };

//   const groupedBookings = useMemo(() => {
//     const groups = {};
//     payments.forEach(payment => {
//       const bookingId = payment.bookingId?.trim();
//       if (!bookingId) return;
//       if (!groups[bookingId]) {
//         groups[bookingId] = {
//           bookingId,
//           applicantName: payment.applicantName || '—',
//           unitNo: payment.unitNo || '—',
//           unitCode: payment.unitCode || '—',
//           block: payment.block || '—',
//           unitType: payment.unitType || '—',
//           size: payment.size || '—',
//           Project: payment.Project || '—',
//           contact: payment.contact || '—',
//           email: payment.email || '—',
//           CurrentAddress: payment.CurrentAddress || '—',
//           agreementValue: stripNum(payment.agreementValue),
//           bookingAmount: stripNum(payment.bookingAmount),
//           balanceToReceive: stripNum(payment.BalanceToRecive),
//           surPlusAmount: stripNum(payment.SurPlusAmount),
//           schedules: []
//         };
//       }
//       groups[bookingId].schedules.push(payment);
//     });
//     return Object.values(groups);
//   }, [payments]);

//   const projectList = useMemo(() => {
//     const set = new Set(groupedBookings.map(b => b.Project).filter(p => p && p !== '—'));
//     return [...set].sort();
//   }, [groupedBookings]);

//   const isDateInRange = (dateStr, from, to) => {
//     const target = parseToDate(dateStr);
//     if (!target) return false;
//     if (!from && !to) return true;
//     const start = from ? new Date(from) : new Date(0);
//     const end = to ? new Date(to) : new Date(8640000000000000);
//     start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
//     return target >= start && target <= end;
//   };

//   const overdueCount = useMemo(() => groupedBookings.filter(b => isBookingOverdue(b)).length, [groupedBookings]);

//   const filteredBookings = useMemo(() => {
//     let result = groupedBookings;
//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       result = result.filter(b => [b.applicantName, b.bookingId, b.unitNo, b.unitCode, b.block, b.contact, b.email, b.Project].some(f => String(f || '').toLowerCase().includes(q)));
//     }
//     if (filterProject) result = result.filter(b => b.Project === filterProject);
//     if (filterOverdue) result = result.filter(b => isBookingOverdue(b));
//     if (fromDate || toDate) {
//       result = result.filter(booking => {
//         const hasMatchingSchedule = booking.schedules.some(sch => {
//           const plannedMatch = isDateInRange(formatDate(sch.Planned), fromDate, toDate);
//           const fuInfo = getLatestFollowUpInfo(sch);
//           return plannedMatch || isDateInRange(fuInfo.nextDate, fromDate, toDate);
//         });
//         return hasMatchingSchedule || isDateInRange(getNextFollowUpForBooking(booking).nextDate, fromDate, toDate);
//       });
//     }
//     return result;
//   }, [groupedBookings, searchQuery, filterProject, filterOverdue, fromDate, toDate]);

//   const filteredOverdueAmount = useMemo(() => filteredBookings.reduce((sum, b) => sum + getBookingOverdueDue(b), 0), [filteredBookings]);
//   const filteredTotalReceived = useMemo(() => filteredBookings.reduce((sum, b) => sum + getBookingTotalReceived(b), 0), [filteredBookings]);

//   const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
//   const paginatedBookings = filteredBookings.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

//   useEffect(() => setCurrentPage(1), [searchQuery, filterProject, filterOverdue, fromDate, toDate, isCRM]);

//   useEffect(() => {
//     if (selectedBooking && groupedBookings.length > 0) {
//       const updated = groupedBookings.find(b => b.bookingId === selectedBooking.bookingId);
//       if (updated) setSelectedBooking(updated);
//     }
//   }, [groupedBookings, selectedBooking]);

//   const stats = useMemo(() => ({
//     total: groupedBookings.length,
//     completed: groupedBookings.filter(b => getBookingStatus(b) === 'completed').length,
//     pending: groupedBookings.filter(b => getBookingStatus(b) === 'pending').length,
//     partial: groupedBookings.filter(b => getBookingStatus(b) === 'partial').length,
//   }), [groupedBookings]);

//   const openDetailModal = (booking) => {
//     setSelectedBooking(booking);
//     setShowDetailModal(true);
//   };

//   const openActionModal = (payment, e, booking) => {
//     e?.stopPropagation();
//     setSelectedPayment(payment);
//     setSelectedBookingForAction(booking || null);
//     setActionForm({
//       status: isCRM ? 'pending' : '',
//       remark: '', amountReceived: '', nextDate: '',
//       lastDateOfReceiving: '', bankName: '', paymentMode: '', paymentDetails: '',
//       gstPercent: '0', tdsAmount: '0'
//     });
//     setShowActionModal(true);
//   };

//   const closeActionModal = () => {
//     setShowActionModal(false);
//     setSelectedPayment(null);
//     setSelectedBookingForAction(null);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setActionForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmitAction = async () => {
//     if (!actionForm.status) { alert("Status select karna zaroori hai"); return; }
//     if (isCRM && actionForm.status !== 'pending') { alert("CRM users sirf Pending status use kar sakte hain"); return; }

//     const paymentStatuses = ['Done', 'partial', 'refund', 'worknotdone'];
//     const isPayment = paymentStatuses.includes(actionForm.status);

//     if (isPayment && (!actionForm.amountReceived || Number(actionForm.amountReceived) <= 0)) {
//       alert("Amount daalna zaroori hai aur 0 se zyada hona chahiye"); return;
//     }
//     if (isPayment && !actionForm.lastDateOfReceiving?.trim()) {
//       alert("Date bharein — yeh zaroori hai"); return;
//     }
//     if (isPayment && (!actionForm.bankName?.trim() || !actionForm.paymentMode?.trim())) {
//       alert("Bank Name aur Payment Mode dono bharein"); return;
//     }
//     if (actionForm.status === 'pending' && (!actionForm.nextDate || !actionForm.remark?.trim())) {
//       alert("Pending ke liye Next Date aur Remark dono bharein"); return;
//     }
//     if (isRefundStatus(actionForm.status) && !actionForm.remark?.trim()) {
//       alert("Refund ka reason likhna zaroori hai"); return;
//     }

//     try {
//       const grossAmount = isWorkNotDoneStatus(actionForm.status)
//         ? gstCalculation.grossAmount.toString()
//         : actionForm.amountReceived || '';

//       await updateSchedulePayment({
//         paymentId: selectedPayment?.paymentId?.trim() || '',
//         status: actionForm.status,
//         lastDateOfReceiving: actionForm.lastDateOfReceiving ? formatDate(actionForm.lastDateOfReceiving) : '',
//         nextDate: formatDate(actionForm.nextDate),
//         amountReceived: grossAmount,
//         remark: actionForm.remark?.trim() || '',
//         bankName: (actionForm.bankName === '—' ? '' : actionForm.bankName?.trim()) || '',
//         paymentMode: actionForm.paymentMode?.trim() || '',
//         paymentDetails: actionForm.paymentDetails?.trim() || '',
//         Planned: formatDate(selectedPayment?.Planned),
//         bookingId: selectedPayment?.bookingId || '',
//         applicantName: selectedPayment?.applicantName || '',
//         contact: selectedPayment?.contact || '',
//         email: selectedPayment?.email || '',
//         CurrentAddress: selectedPayment?.CurrentAddress || '',
//         agreementValue: selectedPayment?.agreementValue || '',
//         bookingAmount: selectedPayment?.bookingAmount || '',
//         unitCode: selectedPayment?.unitCode || '',
//         block: selectedPayment?.block || '',
//         unitNo: selectedPayment?.unitNo || '',
//         unitType: selectedPayment?.unitType || '',
//         size: selectedPayment?.size || '',
//         Project_Name: selectedPayment?.Project || '',
//         Date: formatDate(selectedPayment?.Date),
//         gstPercent: actionForm.gstPercent || '0',
//         cgst: gstCalculation.cgst.toString(),
//         sgst: gstCalculation.sgst.toString(),
//         netAmount: gstCalculation.netAmount.toString(),
//         tdsAmount: isWorkNotDoneStatus(actionForm.status) ? (actionForm.tdsAmount || '0') : '0'
//       }).unwrap();

//       let successMsg = "Successfully updated!";
//       if (isRefundStatus(actionForm.status)) successMsg = "Refund successfully recorded!";
//       if (isWorkNotDoneStatus(actionForm.status)) successMsg = "Work Not Done recorded successfully!";

//       alert(successMsg);
//       closeActionModal();
//     } catch (err) {
//       console.error("Update error:", err);
//       alert("Update failed: " + (err?.data?.message || err?.message || "Unknown error"));
//     }
//   };

//   if (isLoading || isFetching) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//       <div className="text-center">
//         <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
//         <p className="mt-4 text-slate-500 font-medium">Loading payment schedules...</p>
//       </div>
//     </div>
//   );

//   if (isError) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
//       <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md w-full">
//         <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
//         <h2 className="text-xl font-bold text-slate-800 mb-2">Data load nahi hua</h2>
//         <p className="text-slate-500 mb-6">{error?.data?.error || error?.message || 'Something went wrong'}</p>
//         <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Retry</button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
//         <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//           <div>
//             <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//               <IndianRupee className="text-blue-600" size={22} />
//               Payment Schedule Dashboard
//               {isCRM && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">CRM View</span>}
//             </h1>
//             <p className="text-slate-400 text-xs mt-0.5">{isCRM ? 'View and manage pending payment follow-ups' : 'Track and manage all unit payment schedules'}</p>
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             <StatPill label="Total" value={stats.total} color="blue" />
//             <StatPill label="Completed" value={stats.completed} color="green" />
//             <StatPill label="Partial" value={stats.partial} color="amber" />
//             <StatPill label="Pending" value={stats.pending} color="red" />
//           </div>
//         </div>
//       </div>

//       <div className="max-w-screen-2xl mx-auto px-4 py-5 space-y-4">
//         {/* Filter Bar */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
//           <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
//             <div className="relative flex-1 min-w-[240px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
//               <input
//                 type="text"
//                 placeholder="Search by name, booking ID, unit, contact, email, project..."
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
//               />
//             </div>

//             <div className="relative min-w-[180px]">
//               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
//               <select
//                 value={filterProject}
//                 onChange={e => setFilterProject(e.target.value)}
//                 className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white cursor-pointer appearance-none"
//               >
//                 <option value="">All Projects</option>
//                 {projectList.map(p => <option key={p} value={p}>{p}</option>)}
//               </select>
//             </div>

//             <button
//               onClick={() => setFilterOverdue(prev => !prev)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition whitespace-nowrap ${filterOverdue ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
//             >
//               <AlertTriangle size={14} /> Overdue Dues
//               {overdueCount > 0 && (
//                 <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filterOverdue ? 'bg-white text-red-600' : 'bg-red-100 text-red-700'}`}>
//                   {overdueCount}
//                 </span>
//               )}
//             </button>

//             <div className="flex items-center gap-2 flex-wrap">
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={e => setFromDate(e.target.value)}
//                   className="pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white"
//                   title="From Date"
//                 />
//               </div>
//               <span className="text-slate-400 text-xs font-medium">to</span>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={e => setToDate(e.target.value)}
//                   className="pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white"
//                   title="To Date"
//                 />
//               </div>
//               {(fromDate || toDate) && (
//                 <button
//                   onClick={() => { setFromDate(''); setToDate(''); }}
//                   className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 transition"
//                   title="Clear date filter"
//                 >
//                   <X size={14} />
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//             <p className="text-xs text-slate-500">
//               Showing <strong className="text-slate-700">{filteredBookings.length}</strong> of <strong>{groupedBookings.length}</strong> bookings
//             </p>
//             <div className="flex flex-wrap gap-2">
//               <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
//                 <span className="opacity-70">Filtered Overdue Total</span>
//                 <span className="text-lg font-black">{formatCurrencyShort(filteredOverdueAmount)}</span>
//               </div>
//               <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
//                 <span className="opacity-70">Filtered Total Received</span>
//                 <span className="text-lg font-black">{formatCurrencyShort(filteredTotalReceived)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Table */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-800 text-white text-xs uppercase tracking-wide h-12">
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">#</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Planned Date</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Applicant Name</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Booking ID</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Project</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Unit No</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Block</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Unit Type</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Contact</th>
//                   <th className="px-4 py-4 text-right font-semibold whitespace-nowrap">Agr. Value</th>
//                   <th className="px-4 py-4 text-right font-semibold whitespace-nowrap">Total Received</th>
//                   <th className="px-4 py-4 text-right font-semibold whitespace-nowrap">Surplus</th>
//                   <th className="px-4 py-4 text-right font-semibold whitespace-nowrap">Balance Due</th>
//                   <th className="px-4 py-4 text-right font-semibold whitespace-nowrap">Overdue Due</th>
//                   <th className="px-4 py-4 text-center font-semibold whitespace-nowrap">Schedules</th>
//                   <th className="px-4 py-4 text-center font-semibold whitespace-nowrap">Pending</th>
//                   <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Next Follow-up</th>
//                   <th className="px-4 py-4 text-center font-semibold whitespace-nowrap">Status</th>
//                   <th className="px-4 py-4 text-center font-semibold whitespace-nowrap">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {paginatedBookings.length === 0 ? (
//                   <tr>
//                     <td colSpan={19} className="py-20 text-center">
//                       <Search size={36} className="mx-auto mb-3 text-slate-300" />
//                       <p className="font-medium text-slate-500">No bookings found</p>
//                       <p className="text-xs text-slate-400 mt-1">Try changing your search or filters</p>
//                     </td>
//                   </tr>
//                 ) : paginatedBookings.map((booking, idx) => {
//                   const status = getBookingStatus(booking);
//                   const balanceMap = getScheduleBalancesWithSpillover(booking);
//                   const total = booking.schedules.length;
//                   const pendingCount = booking.schedules.filter(s => {
//                     const key = getScheduleKey(s);
//                     const info = balanceMap.get(key);
//                     return info ? !info.isComplete : getScheduleBalance(s) > 0;
//                   }).length;
//                   const followUpData = getNextFollowUpForBooking(booking);
//                   const fuInfo = { nextDate: followUpData.nextDate, count: followUpData.count };
//                   const rowNum = (currentPage - 1) * rowsPerPage + idx + 1;
//                   const earliestPlanned = getEarliestPendingPlanned(booking);
//                   const plannedOverdue = earliestPlanned ? isOverdue(earliestPlanned) : false;
//                   const nextFuOverdue = fuInfo.nextDate && fuInfo.nextDate !== '—' ? isOverdue(fuInfo.nextDate) : false;
//                   const isHighlighted = status !== 'completed' && (plannedOverdue || nextFuOverdue);
//                   const totalReceived = getBookingTotalReceived(booking);
//                   const totalSurplus = getBookingTotalSurplus(booking);
//                   const balanceDue = getBookingBalanceDue(booking);
//                   const overdueDue = getBookingOverdueDue(booking);
//                   const totalRefund = getBookingTotalRefund(booking);

//                   return (
//                     <tr
//                       key={booking.bookingId}
//                       className={`transition-colors cursor-pointer ${isHighlighted ? 'bg-red-50 hover:bg-red-100/60' : 'hover:bg-blue-50/40'}`}
//                       onClick={() => openDetailModal(booking)}
//                     >
//                       <td className="px-4 py-3.5 text-slate-400 text-xs font-medium whitespace-nowrap">{rowNum}</td>
//                       <td className="px-4 py-3.5 text-xs whitespace-nowrap">
//                         {earliestPlanned ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-semibold ${plannedOverdue && status !== 'completed' ? 'bg-orange-100 text-orange-700' : 'text-slate-600'}`}>
//                             {plannedOverdue && status !== 'completed' && <span title="Overdue">!</span>}{earliestPlanned}
//                           </span>
//                         ) : <span className="text-slate-400">—</span>}
//                       </td>
//                       <td className="px-4 py-3.5 whitespace-nowrap">
//                         <div className="font-semibold text-slate-800 text-sm">{booking.applicantName}</div>
//                         <div className="text-xs text-slate-400 mt-0.5">{booking.email !== '—' ? booking.email : booking.contact}</div>
//                       </td>
//                       <td className="px-4 py-3.5 whitespace-nowrap">
//                         <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{booking.bookingId}</span>
//                       </td>
//                       <td className="px-4 py-3.5 whitespace-nowrap">
//                         <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">{booking.Project}</span>
//                       </td>
//                       <td className="px-4 py-3.5 text-slate-700 font-medium text-sm whitespace-nowrap">{booking.unitNo}</td>
//                       <td className="px-4 py-3.5 text-slate-500 text-sm whitespace-nowrap">{booking.block}</td>
//                       <td className="px-4 py-3.5 text-slate-500 text-sm whitespace-nowrap">{booking.unitType}</td>
//                       <td className="px-4 py-3.5 text-slate-600 text-sm whitespace-nowrap">{booking.contact}</td>
//                       <td className="px-4 py-3.5 text-right whitespace-nowrap">
//                         <div className="font-semibold text-slate-800 text-sm">{formatCurrencyShort(booking.agreementValue)}</div>
//                       </td>
//                       <td className="px-4 py-3.5 text-right whitespace-nowrap">
//                         <div className="font-semibold text-emerald-700 text-sm">{formatCurrencyShort(totalReceived)}</div>
//                         {totalRefund > 0 && (
//                           <div className="text-[11px] text-orange-600 font-semibold mt-0.5">
//                             <span className="flex items-center justify-end gap-0.5"><ArrowDownLeft size={10} />−{formatCurrencyShort(totalRefund)}</span>
//                             <span className="text-[10px] text-amber-600">Net: {formatCurrencyShort(getNetReceived(booking))}</span>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 py-3.5 text-right whitespace-nowrap">
//                         {totalSurplus > 0 ? (
//                           <span className="inline-flex items-center gap-0.5 font-semibold text-teal-700 text-sm">
//                             <TrendingUp size={12} />{formatCurrencyShort(totalSurplus)}
//                           </span>
//                         ) : <span className="text-slate-400 text-sm">—</span>}
//                       </td>
//                       <td className="px-4 py-3.5 text-right font-semibold text-amber-700 text-sm whitespace-nowrap">{formatCurrencyShort(balanceDue)}</td>
//                       <td className="px-4 py-3.5 text-right font-semibold text-red-700 text-sm whitespace-nowrap">{formatCurrencyShort(overdueDue)}</td>
//                       <td className="px-4 py-3.5 text-center whitespace-nowrap">
//                         <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">{total}</span>
//                       </td>
//                       <td className="px-4 py-3.5 text-center whitespace-nowrap">
//                         {pendingCount > 0 ? (
//                           <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">{pendingCount}</span>
//                         ) : (
//                           <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">0</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3.5 text-xs whitespace-nowrap font-medium">
//                         {fuInfo.nextDate && fuInfo.nextDate !== '—' ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-semibold ${nextFuOverdue ? 'bg-red-100 text-red-700' : 'text-purple-700 bg-purple-50'}`}>
//                             {nextFuOverdue && <span title="Overdue">⚠</span>}{fuInfo.nextDate}
//                           </span>
//                         ) : <span className="text-slate-400">—</span>}
//                       </td>
//                       <td className="px-4 py-3.5 text-center whitespace-nowrap">
//                         <StatusChip status={status} />
//                       </td>
//                       <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-center gap-2">
//                           <button onClick={() => openDetailModal(booking)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition" title="View Details"><Eye size={14} /></button>
//                           {/* Show Take Action only when Balance Due > 0 */}
//                           {balanceDue > 0 && (
//                             <button onClick={e => {
//                               // Find first non-complete schedule, or fallback to first schedule
//                               const firstPending = booking.schedules.find(s => {
//                                 const key = getScheduleKey(s);
//                                 const info = balanceMap.get(key);
//                                 return info ? !info.isComplete : getScheduleBalance(s) > 0;
//                               });
//                               openActionModal(firstPending || booking.schedules[0], e, booking);
//                             }} disabled={isUpdating} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition disabled:opacity-50" title="Take Action"><Edit3 size={14} /></button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {totalPages > 1 && (
//             <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
//               <p className="text-xs text-slate-500">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> — <strong>{filteredBookings.length}</strong> results</p>
//               <div className="flex items-center gap-1">
//                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={14} /></button>
//                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                   let page;
//                   if (totalPages <= 5) page = i + 1;
//                   else if (currentPage <= 3) page = i + 1;
//                   else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
//                   else page = currentPage - 2 + i;
//                   return (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}
//                     >
//                       {page}
//                     </button>
//                   );
//                 })}
//                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={14} /></button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ─── Detail Modal ─── */}
//       {showDetailModal && selectedBooking && (
//         <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-start justify-center p-4 pt-8 z-50 overflow-y-auto">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mb-10">
//             <div className="sticky top-0 z-10 bg-slate-900 p-5 rounded-t-2xl text-white">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h2 className="text-lg font-bold">{selectedBooking.applicantName}</h2>
//                   <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-xs text-slate-300">
//                     <span><span className="opacity-60">Booking: </span><span className="font-mono font-bold text-white">{selectedBooking.bookingId}</span></span>
//                     <span><span className="opacity-60">Project: </span><span className="font-bold text-white">{selectedBooking.Project}</span></span>
//                     <span><span className="opacity-60">Unit: </span><span className="font-bold text-white">{selectedBooking.unitNo}</span></span>
//                     <span className="flex items-center gap-1"><Phone size={10} /> {selectedBooking.contact}</span>
//                     <span className="flex items-center gap-1"><Mail size={10} /> {selectedBooking.email}</span>
//                   </div>
//                 </div>
//                 <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition ml-4 flex-shrink-0"><X size={20} /></button>
//               </div>
//             </div>

//             <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//                 <InfoCell label="Unit Code" value={selectedBooking.unitCode} />
//                 <InfoCell label="Block" value={selectedBooking.block} />
//                 <InfoCell label="Unit Type" value={selectedBooking.unitType} />
//                 <InfoCell label="Size" value={selectedBooking.size} />
//                 <InfoCell label="Agreement Value" value={formatCurrencyShort(selectedBooking.agreementValue)} highlight />
//                 <InfoCell label="Booking Amount (Ignored)" value={formatCurrencyShort(selectedBooking.bookingAmount)} />
//               </div>
//               {selectedBooking.CurrentAddress !== '—' && (
//                 <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
//                   <MapPin size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />{selectedBooking.CurrentAddress}
//                 </div>
//               )}
//             </div>

//             {(() => {
//               const originalAgrValue = stripNum(selectedBooking.agreementValue);
//               const totalReceived = getBookingTotalReceived(selectedBooking);
//               const totalRefund = getBookingTotalRefund(selectedBooking);
//               const totalSurplus = getBookingTotalSurplus(selectedBooking);
//               const netReceived = getNetReceived(selectedBooking);
//               const balanceDue = getBookingBalanceDue(selectedBooking);
//               const overdueDue = getBookingOverdueDue(selectedBooking);
//               const pct = originalAgrValue > 0 ? Math.round((Math.min(netReceived, originalAgrValue) / originalAgrValue) * 100) : 0;
//               const hasRefund = totalRefund > 0;
//               const hasSurplus = totalSurplus > 0;

//               return (
//                 <div className="mx-5 mb-0 mt-4 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
//                   <div className="bg-slate-700 px-5 py-2.5 flex items-center gap-2">
//                     <IndianRupee size={14} className="text-slate-300" />
//                     <span className="text-xs font-bold text-white uppercase tracking-wide">Payment Summary</span>
//                     <span className="ml-auto text-xs text-slate-300">{pct}% collected</span>
//                   </div>
//                   <div className="overflow-x-auto">
//                     <div className="flex divide-x divide-slate-100 bg-white w-full min-w-max">
//                       <div className="px-4 py-3 flex-1 min-w-[130px]">
//                         <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Agreement Value</p>
//                         <p className="font-bold text-slate-800 text-sm">{formatCurrencyShort(originalAgrValue)}</p>
//                       </div>
//                       <div className="px-4 py-3 bg-emerald-50 flex-1 min-w-[140px]">
//                         <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Total Received</p>
//                         <p className="font-black text-emerald-700 text-base">{formatCurrencyShort(totalReceived)}</p>
//                         <p className="text-[10px] text-emerald-500 mt-0.5">Gross amount across schedules</p>
//                       </div>
//                       {hasRefund && (
//                         <div className="px-4 py-3 bg-orange-50 flex-1 min-w-[140px]">
//                           <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
//                             <ArrowDownLeft size={11} /> Total Refunded
//                           </p>
//                           <p className="font-black text-orange-700 text-base">−{formatCurrencyShort(totalRefund)}</p>
//                           <p className="text-[10px] text-orange-400 mt-0.5">Deducted from received</p>
//                         </div>
//                       )}
//                       <div className="px-4 py-3 bg-green-50 flex-1 min-w-[140px]">
//                         <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Net Received</p>
//                         <p className="font-black text-green-700 text-base">{formatCurrencyShort(netReceived)}</p>
//                         <p className="text-[10px] text-green-500 mt-0.5">Received - Refund</p>
//                       </div>
//                       {hasSurplus && (
//                         <div className="px-4 py-3 bg-teal-50 flex-1 min-w-[130px]">
//                           <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
//                             <TrendingUp size={11} /> Total Surplus
//                           </p>
//                           <p className="font-black text-teal-700 text-base">{formatCurrencyShort(totalSurplus)}</p>
//                           <p className="text-[10px] text-teal-500 mt-0.5">Above agreement value</p>
//                         </div>
//                       )}
//                       <div className="px-4 py-3 bg-red-50 flex-1 min-w-[130px]">
//                         <p className="text-xs text-red-500 font-medium uppercase tracking-wide mb-1">Overdue Due</p>
//                         <p className="font-black text-red-700 text-base">{formatCurrencyShort(overdueDue)}</p>
//                         <p className="text-[10px] text-red-400 mt-0.5">Past planned dates</p>
//                       </div>
//                       <div className="px-4 py-3 bg-amber-50 flex-1 min-w-[140px]">
//                         <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">Balance Due</p>
//                         <p className="font-black text-amber-700 text-base">{formatCurrencyShort(balanceDue)}</p>
//                         <p className="text-[10px] text-amber-500 mt-0.5">Agreement - Net Received</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="h-2 bg-slate-100">
//                     <div className="h-2 bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} />
//                   </div>
//                 </div>
//               );
//             })()}

//             <div className="p-5 space-y-6">
//               <h3 className="font-bold text-slate-800 flex items-center gap-2">
//                 <Calendar size={17} className="text-blue-600" />
//                 Payment Schedules ({selectedBooking.schedules.length})
//               </h3>

//               {(() => {
//                 const balanceMap = getScheduleBalancesWithSpillover(selectedBooking);

//                 return selectedBooking.schedules.map((sch, i) => {
//                   const schAmount = stripNum(sch.Amount);
//                   const totalReceivedSch = getScheduleTotalReceived(sch);
//                   const totalRefundSch = getScheduleTotalRefund(sch);

//                   // Use spillover-aware balance and completion
//                   const key = getScheduleKey(sch);
//                   const spilloverInfo = balanceMap.get(key);
//                   const balance = spilloverInfo ? spilloverInfo.balance : getScheduleBalance(sch);
//                   const isComplete = spilloverInfo ? spilloverInfo.isComplete : balance <= 0;
//                   const spilloverSurplus = spilloverInfo?.surplus || 0;

//                   const isScheduleOverdue = isOverdue(sch.Planned) && !isComplete;
//                   const hasPrev = sch.previousPayments?.length > 0;
//                   const hasFU = sch.followUpHistory?.length > 0;
//                   const sortedFU = hasFU ? [...sch.followUpHistory].sort((a, b) => new Date(b.timestamp || b.dateOfFollowup || 0) - new Date(a.timestamp || a.dateOfFollowup || 0)) : [];
//                   const fuInfo = getLatestFollowUpInfo(sch);

//                   return (
//                     <div key={i} className={`rounded-xl border-2 overflow-hidden shadow-sm ${isComplete ? 'border-emerald-200' : isScheduleOverdue ? 'border-red-300' : 'border-slate-200'}`}>
//                       <div className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 ${isComplete ? 'bg-emerald-50' : isScheduleOverdue ? 'bg-red-50' : 'bg-slate-50'} border-b border-slate-200`}>
//                         <div className="flex flex-wrap items-center gap-3 text-sm">
//                           <span className="font-bold text-slate-800">Schedule #{i + 1}</span>
//                           <span className="text-slate-400">|</span>
//                           <span className={`text-slate-600 ${isScheduleOverdue ? 'text-red-600' : ''}`}>
//                             Planned: <strong className={isScheduleOverdue ? 'text-red-700' : 'text-slate-800'}>{formatDate(sch.Planned, true)}</strong>
//                             {isScheduleOverdue && <span className="ml-1 text-red-600 text-xs">(Overdue!)</span>}
//                           </span>
//                           <span className="text-slate-400">|</span>
//                           <span className="text-slate-500 text-xs font-medium">Schedule Amount:</span>
//                           <span className="font-bold text-blue-700">{formatCurrencyShort(schAmount)}</span>
//                           <span className="text-slate-400">|</span>
//                           {isComplete ? (
//                             <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> Fully Received</span>
//                           ) : (
//                             <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isScheduleOverdue ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'}`}>
//                               Balance: {formatCurrencyShort(balance)}
//                             </span>
//                           )}
//                           {totalRefundSch > 0 && (
//                             <>
//                               <span className="text-slate-400">|</span>
//                               <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
//                                 <ArrowDownLeft size={11} />Refunded: {formatCurrencyShort(totalRefundSch)}
//                               </span>
//                             </>
//                           )}
//                           {isComplete && spilloverSurplus > 0 && (
//                             <>
//                               <span className="text-slate-400">|</span>
//                               <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
//                                 <TrendingUp size={11} />Surplus: {formatCurrencyShort(spilloverSurplus)} → Next Schedule
//                               </span>
//                             </>
//                           )}
//                         </div>

//                         {balance > 0 && (
//                           <button onClick={e => openActionModal(sch, e, selectedBooking)} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 flex-shrink-0">
//                             <Edit3 size={12} /> Take Action
//                           </button>
//                         )}
//                       </div>

//                       <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-5 gap-4 bg-white border-b border-slate-100 text-xs">
//                         <div><p className="text-slate-400 mb-0.5">Payment ID</p><p className="font-mono font-semibold text-slate-700">{sch.paymentId || '—'}</p></div>
//                         <div><p className="text-slate-400 mb-0.5">Total Received</p><p className="font-bold text-emerald-700">{totalReceivedSch > 0 ? formatCurrencyShort(totalReceivedSch) : '—'}</p></div>
//                         <div><p className="text-slate-400 mb-0.5">Balance</p><p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{balance > 0 ? formatCurrencyShort(balance) : '₹0'}</p></div>
//                         <div><p className="text-slate-400 mb-0.5">Refunded</p><p className={`font-bold ${totalRefundSch > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{totalRefundSch > 0 ? `−${formatCurrencyShort(totalRefundSch)}` : '—'}</p></div>
//                         <div><p className="text-slate-400 mb-0.5">Next Follow-up</p><p className="font-bold text-purple-700">{fuInfo.nextDate}</p></div>
//                       </div>

//                       <div className="border-b border-slate-100">
//                         <div className="px-5 py-2.5 bg-blue-700 flex items-center gap-2">
//                           <DollarSign size={13} className="text-blue-200" />
//                           <span className="text-xs font-bold text-white uppercase tracking-wide">
//                             Payment Received History — {sch.previousPayments?.length || 0} {(sch.previousPayments?.length || 0) === 1 ? 'Entry' : 'Entries'}
//                           </span>
//                         </div>
//                         <div className="overflow-x-auto">
//                           <table className="w-full text-xs">
//                             <thead>
//                               <tr className="bg-blue-50 text-blue-900 border-b border-blue-100">
//                                 <th className="px-4 py-2.5 text-left font-semibold w-10">#</th>
//                                 <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Date</th>
//                                 <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Gross Amount</th>
//                                 <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">CGST</th>
//                                 <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">SGST</th>
//                                 <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Net Amount</th>
//                                 <th className="px-4 py-2.5 text-center font-semibold whitespace-nowrap">Status</th>
//                                 <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">TDS / Next F/U</th>
//                                 <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Remark</th>
//                               </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100 bg-white">
//                               {!hasPrev ? (
//                                 <tr><td colSpan={9} className="px-5 py-4 text-center text-xs text-slate-400">No payment received yet for this schedule.</td></tr>
//                               ) : (
//                                 <>
//                                   {sch.previousPayments.map((pay, pi) => {
//                                     const netAmt = getPreviousAmount(pay);
//                                     const grossAmt = parseFloat(pay.grossAmount) || 0;
//                                     const cgst = parseFloat(pay.cgst) || 0;
//                                     const sgst = parseFloat(pay.sgst) || 0;
//                                     const payStatus = (pay.status || '').toLowerCase();
//                                     const isDoneStatus = ['done', 'completed', 'paid', 'complete'].includes(payStatus);
//                                     const isRefund = isRefundPayment(pay);
//                                     const isWND = isWorkNotDonePayment(pay);

//                                     return (
//                                       <tr key={pi} className={`transition-colors ${isRefund ? 'bg-orange-50/70 hover:bg-orange-50' : isWND ? 'bg-yellow-50/70 hover:bg-yellow-50' : 'hover:bg-blue-50/30'}`}>
//                                         <td className="px-4 py-2.5 text-slate-400 font-medium whitespace-nowrap">{pi + 1}</td>
//                                         <td className="px-4 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
//                                           {formatDate(pay.previousReceviedAmountDate, true)}
//                                           {isRefund && <span className="ml-1.5 bg-orange-200 text-orange-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">REFUND</span>}
//                                           {isWND && <span className="ml-1.5 bg-yellow-200 text-yellow-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">WND</span>}
//                                         </td>
//                                         <td className="px-4 py-2.5 text-right whitespace-nowrap">
//                                           <span className={`font-bold ${isRefund ? 'text-orange-600' : grossAmt > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
//                                             {isRefund ? `−${formatCurrencyShort(grossAmt)}` : formatCurrencyShort(grossAmt)}
//                                           </span>
//                                         </td>
//                                         <td className="px-4 py-2.5 text-right whitespace-nowrap">
//                                           <span className={`font-semibold ${isRefund ? 'text-orange-400 line-through' : 'text-orange-600'}`}>{formatCurrencyShort(cgst)}</span>
//                                         </td>
//                                         <td className="px-4 py-2.5 text-right whitespace-nowrap">
//                                           <span className={`font-semibold ${isRefund ? 'text-orange-400 line-through' : 'text-purple-600'}`}>{formatCurrencyShort(sgst)}</span>
//                                         </td>
//                                         <td className="px-4 py-2.5 text-right whitespace-nowrap">
//                                           <span className={`font-bold ${isRefund ? 'text-orange-700' : netAmt > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
//                                             {isRefund ? `−${formatCurrencyShort(netAmt)}` : formatCurrencyShort(netAmt)}
//                                           </span>
//                                         </td>
//                                         <td className="px-4 py-2.5 text-center whitespace-nowrap">
//                                           {isRefund ? (
//                                             <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap bg-orange-100 text-orange-700 border border-orange-200">
//                                               <ArrowDownLeft size={10} /> Refund
//                                             </span>
//                                           ) : isWND ? (
//                                             <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap bg-yellow-100 text-yellow-700 border border-yellow-200">
//                                               <FileText size={10} /> Work Not Done
//                                             </span>
//                                           ) : (
//                                             <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap ${isDoneStatus ? 'bg-emerald-100 text-emerald-700' : payStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
//                                               {isDoneStatus ? '✓ Done' : payStatus === 'partial' ? '◑ Partial' : pay.status || '—'}
//                                             </span>
//                                           )}
//                                         </td>
//                                         <td className="px-4 py-2.5 text-purple-700 font-medium whitespace-nowrap">
//                                           {isWND ? (
//                                             <span className="text-yellow-700 flex items-center gap-1">
//                                               <span className="text-[10px] text-yellow-500 font-bold">TDS:</span>
//                                               {pay.NextDate || '—'}
//                                             </span>
//                                           ) : formatDate(pay.NextDate, true)}
//                                         </td>
//                                         <td className="px-4 py-2.5 text-slate-500 max-w-xs">{pay.previousRemark || '—'}</td>
//                                       </tr>
//                                     );
//                                   })}
//                                 </>
//                               )}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       {hasFU ? (
//                         <div>
//                           <div className="px-5 py-2.5 bg-purple-700 flex items-center gap-2">
//                             <MessageSquare size={13} className="text-purple-200" />
//                             <span className="text-xs font-bold text-white uppercase tracking-wide">Follow-up History — {sortedFU.length} Follow-up{sortedFU.length !== 1 ? 's' : ''}</span>
//                           </div>
//                           <div className="overflow-x-auto">
//                             <table className="w-full text-xs">
//                               <thead>
//                                 <tr className="bg-purple-50 text-purple-900 border-b border-purple-100">
//                                   <th className="px-4 py-2.5 text-left font-semibold w-16"># / Tag</th>
//                                   <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Follow-up Date</th>
//                                   <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Next Follow-up Date</th>
//                                   <th className="px-4 py-2.5 text-center font-semibold whitespace-nowrap">Follow-up No.</th>
//                                   <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Remark / Notes</th>
//                                   <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Status</th>
//                                 </tr>
//                               </thead>
//                               <tbody className="divide-y divide-slate-100 bg-white">
//                                 {sortedFU.map((fu, fi) => {
//                                   const isLatest = fi === 0;
//                                   const fuStatus = fu.status?.toLowerCase() || '';
//                                   return (
//                                     <tr key={fi} className={`transition-colors ${isLatest ? 'bg-purple-50/50' : 'hover:bg-purple-50/20'}`}>
//                                       <td className="px-4 py-3 align-top whitespace-nowrap">
//                                         <span className="text-slate-400 font-medium">{sortedFU.length - fi}</span>
//                                         {isLatest && <span className="ml-1.5 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold align-middle">LATEST</span>}
//                                       </td>
//                                       <td className="px-4 py-3 align-top whitespace-nowrap">
//                                         <div className="flex items-center gap-1.5 font-semibold text-slate-700"><Clock size={10} className="text-slate-400 flex-shrink-0" />{formatDate(fu.dateOfFollowup, true)}</div>
//                                       </td>
//                                       <td className="px-4 py-3 align-top font-semibold text-purple-700 whitespace-nowrap">{formatDate(fu.nextDateOfFollowup, true)}</td>
//                                       <td className="px-4 py-3 text-center align-top whitespace-nowrap"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">{fu.followupCount || '—'}</span></td>
//                                       <td className="px-4 py-3 text-slate-600 align-top leading-relaxed max-w-sm">{fu.remark || '—'}</td>
//                                       <td className="px-4 py-3 align-top whitespace-nowrap">
//                                         <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap ${fuStatus === 'done' || fuStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : fuStatus === 'pending' ? 'bg-orange-100 text-orange-700' : fuStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
//                                           {fu.status || '—'}
//                                         </span>
//                                       </td>
//                                     </tr>
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="px-5 py-5 bg-white flex items-center gap-2 text-xs text-slate-400">
//                           <MessageSquare size={14} className="text-slate-300" />No follow-up records yet for this schedule.
//                         </div>
//                       )}
//                     </div>
//                   );
//                 });
//               })()}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── Action Modal ─── */}
//       {showActionModal && selectedPayment && (
//         <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="bg-slate-900 p-5 rounded-t-2xl text-white flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold flex items-center gap-2"><Edit3 size={18} /> Take Action
//                   {isCRM && <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">CRM</span>}
//                 </h2>
//                 <p className="text-xs text-slate-300 mt-0.5">{selectedPayment.applicantName} • {selectedPayment.unitNo} • {selectedPayment.bookingId}</p>
//               </div>
//               <button onClick={closeActionModal} disabled={isUpdating} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
//             </div>

//             <div className="p-5 space-y-5">
//               {(() => {
//                 const schAmount = stripNum(selectedPayment.Amount);
//                 const alreadyRec = getScheduleTotalReceived(selectedPayment);
//                 const booking = selectedBookingForAction;

//                 // Use spillover-aware balance
//                 let stillDue = Math.max(0, schAmount - alreadyRec);
//                 if (booking) {
//                   stillDue = getEffectiveScheduleBalance(selectedPayment, booking);
//                 }

//                 const pct = schAmount > 0 ? Math.round((Math.min(alreadyRec, schAmount) / schAmount) * 100) : 0;
//                 const bookingSurplus = booking ? getBookingTotalSurplus(booking) : 0;

//                 return (
//                   <div className="rounded-xl border border-slate-200 overflow-hidden">
//                     <div className="bg-slate-700 px-4 py-2 flex items-center gap-2">
//                       <IndianRupee size={13} className="text-slate-300" />
//                       <span className="text-xs font-bold text-white uppercase tracking-wide">Schedule Payment Summary</span>
//                     </div>
//                     <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-slate-100 bg-white">
//                       <div className="px-4 py-3">
//                         <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Booking ID</p>
//                         <p className="font-mono font-bold text-slate-800 text-sm">{selectedPayment.bookingId}</p>
//                         <p className="text-xs text-slate-500 mt-0.5">Unit: {selectedPayment.unitNo}</p>
//                       </div>
//                       <div className="px-4 py-3">
//                         <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Schedule Amount</p>
//                         <p className="font-bold text-blue-700 text-sm">{formatCurrencyShort(schAmount)}</p>
//                         <p className="text-xs text-slate-500 mt-0.5">Planned: {formatDate(selectedPayment.Planned, true)}</p>
//                       </div>
//                       <div className="px-4 py-3 bg-emerald-50">
//                         <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Already Received</p>
//                         <p className="font-black text-emerald-700 text-base">{formatCurrencyShort(alreadyRec)}</p>
//                         <p className="text-xs text-emerald-600 mt-0.5">{pct}% of this schedule</p>
//                       </div>
//                       <div className="px-4 py-3 bg-red-50">
//                         <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Still Due</p>
//                         <p className="font-black text-red-700 text-base">{formatCurrencyShort(stillDue)}</p>
//                         <p className="text-xs text-red-500 mt-0.5">Remaining in this schedule</p>
//                       </div>
//                       <div className={`px-4 py-3 ${bookingSurplus > 0 ? 'bg-teal-50' : ''}`}>
//                         <p className="text-xs text-teal-600 uppercase tracking-wide mb-1 flex items-center gap-1"><TrendingUp size={10} /> Booking Surplus</p>
//                         <p className={`font-black text-base ${bookingSurplus > 0 ? 'text-teal-700' : 'text-slate-400'}`}>
//                           {bookingSurplus > 0 ? formatCurrencyShort(bookingSurplus) : '₹0'}
//                         </p>
//                         <p className="text-xs text-teal-500 mt-0.5">Agreement value based</p>
//                       </div>
//                     </div>
//                     <div className="h-1.5 bg-slate-100"><div className="h-1.5 bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} /></div>
//                   </div>
//                 );
//               })()}

//               {isCRM && (
//                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
//                   <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
//                   <div className="text-sm text-orange-800"><p className="font-semibold">CRM Access</p><p className="text-xs mt-0.5">Aap sirf Pending status ke saath follow-up add kar sakte hain.</p></div>
//                 </div>
//               )}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <FormField label="Status" required>
//                   <select name="status" value={actionForm.status} onChange={handleFormChange} disabled={isUpdating || isCRM}
//                     className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
//                     <option value="">Select Status</option>
//                     {!isCRM && <option value="partial">◑ Partial Payment</option>}
//                     {!isCRM && <option value="refund">↩ Refund Payment</option>}
//                     {!isCRM && <option value="worknotdone">📝 Work Not Done</option>}
//                     <option value="pending">⏳ Pending</option>
//                   </select>
//                 </FormField>

//                 {!isCRM && isPaymentStatus(actionForm.status) && (
//                   <>
//                     <FormField label={isRefundStatus(actionForm.status) ? 'Date of Refund' : 'Date of Receiving'} required>
//                       <input type="date" name="lastDateOfReceiving" value={actionForm.lastDateOfReceiving} onChange={handleFormChange} disabled={isUpdating}
//                         className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none text-sm border-slate-200 focus:border-blue-400" />
//                     </FormField>

//                     <FormField label={isRefundStatus(actionForm.status) ? 'Refund Amount' : 'Amount Received'} required>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
//                         <input type="number" name="amountReceived" value={actionForm.amountReceived} onChange={handleFormChange} placeholder="0" min="0" disabled={isUpdating}
//                           className="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg focus:outline-none text-sm border-slate-200 focus:border-blue-400" />
//                       </div>
//                     </FormField>

//                     <FormField label="Bank Account" required>
//                       <select name="bankName" value={actionForm.bankName} onChange={handleFormChange} disabled={isUpdating || banksLoading}
//                         className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm">
//                         <option value="">Select Bank Account</option>
//                         {(bankMapping?.list || bankMapping?.data || []).map((item, idx) => {
//                           const val = (item.bankAccount && item.bankAccount !== '—') ? item.bankAccount : item.project;
//                           const label = (item.bankAccount && item.bankAccount !== '—') ? `${item.project} — ${item.bankAccount}` : item.project;
//                           return <option key={idx} value={val}>{label}</option>;
//                         })}
//                       </select>
//                     </FormField>

//                     <FormField label="Payment Mode" required>
//                       <select name="paymentMode" value={actionForm.paymentMode} onChange={handleFormChange} disabled={isUpdating}
//                         className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm">
//                         <option value="">Select Mode</option>
//                         <option value="Cash">Cash</option>
//                         <option value="Cheque">Cheque</option>
//                         <option value="NEFT">NEFT</option>
//                         <option value="RTGS">RTGS</option>
//                         <option value="UPI">UPI</option>
//                         <option value="Other">Other</option>
//                       </select>
//                     </FormField>

//                     <FormField label="Payment Details">
//                       <input type="text" name="paymentDetails" value={actionForm.paymentDetails} onChange={handleFormChange} placeholder="Cheque No / UTR / Transaction ID etc." disabled={isUpdating}
//                         className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm" />
//                     </FormField>

//                     <FormField label="GST %">
//                       <div className="relative">
//                         <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
//                         <select name="gstPercent" value={actionForm.gstPercent} onChange={handleFormChange} disabled={isUpdating}
//                           className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm bg-white cursor-pointer appearance-none">
//                           <option value="0">0% (No GST)</option>
//                           <option value="5">5%</option>
//                           <option value="12">12%</option>
//                           <option value="18">18%</option>
//                         </select>
//                       </div>
//                     </FormField>

//                     {isWorkNotDoneStatus(actionForm.status) && (
//                       <FormField label="TDS Amount">
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
//                           <input type="number" name="tdsAmount" value={actionForm.tdsAmount} onChange={handleFormChange} placeholder="0" min="0" disabled={isUpdating}
//                             className="w-full pl-8 pr-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm" />
//                         </div>
//                       </FormField>
//                     )}

//                     {(parseFloat(actionForm.gstPercent) > 0 || isWorkNotDoneStatus(actionForm.status)) && (parseFloat(actionForm.amountReceived) > 0) && (
//                       <div className="md:col-span-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
//                         <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">GST Breakdown</p>
//                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
//                           {isWorkNotDoneStatus(actionForm.status) && (
//                             <div>
//                               <p className="text-slate-400">Gross (Amount + TDS)</p>
//                               <p className="font-bold text-slate-800">{formatCurrencyShort(gstCalculation.grossAmount)}</p>
//                             </div>
//                           )}
//                           <div>
//                             <p className="text-slate-400">Net Amount</p>
//                             <p className="font-bold text-emerald-700">{formatCurrencyShort(gstCalculation.netAmount)}</p>
//                           </div>
//                           <div>
//                             <p className="text-slate-400">CGST ({(parseFloat(actionForm.gstPercent) || 0) / 2}%)</p>
//                             <p className="font-bold text-orange-600">{formatCurrencyShort(gstCalculation.cgst)}</p>
//                           </div>
//                           <div>
//                             <p className="text-slate-400">SGST ({(parseFloat(actionForm.gstPercent) || 0) / 2}%)</p>
//                             <p className="font-bold text-purple-600">{formatCurrencyShort(gstCalculation.sgst)}</p>
//                           </div>
//                           {isWorkNotDoneStatus(actionForm.status) && (
//                             <div>
//                               <p className="text-slate-400">TDS Amount</p>
//                               <p className="font-bold text-yellow-700">{formatCurrencyShort(gstCalculation.tds)}</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     <FormField label="Remark / Notes" className="md:col-span-2">
//                       <textarea name="remark" value={actionForm.remark} onChange={handleFormChange} rows={3}
//                         disabled={isUpdating}
//                         className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm resize-none" />
//                     </FormField>
//                   </>
//                 )}

//                 {(isCRM || actionForm.status === 'pending') && (
//                   <>
//                     <FormField label="Next Follow-up Date" required>
//                       <input type="date" name="nextDate" value={actionForm.nextDate} onChange={handleFormChange} disabled={isUpdating}
//                         className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm" />
//                     </FormField>
//                     <FormField label="Remark / Notes" required className="md:col-span-2">
//                       <textarea name="remark" value={actionForm.remark} onChange={handleFormChange} rows={3}
//                         disabled={isUpdating}
//                         className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm resize-none" />
//                     </FormField>
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="px-5 py-4 bg-slate-50 border-t flex gap-3 justify-end rounded-b-2xl">
//               <button onClick={closeActionModal} disabled={isUpdating}
//                 className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition text-sm disabled:opacity-60">Cancel</button>
//               <button onClick={handleSubmitAction} disabled={isUpdating || !actionForm.status}
//                 className="px-6 py-2.5 text-white font-bold rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700">
//                 {isUpdating ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : 'Submit Action'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SchedulePayment;




/////////   




import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar, Search, AlertCircle,
  Edit3, X, Loader2, MessageSquare,
  Filter, ChevronLeft, ChevronRight, Eye,
  Clock, CheckCircle2, AlertTriangle, IndianRupee, Phone, Mail, MapPin,
  Percent, TrendingUp, DollarSign, ArrowDownLeft, FileText
} from 'lucide-react';

import {
  useGetSchedulePaymentsQuery,
  useUpdateSchedulePaymentMutation,
  useGetProjectBankMappingQuery
} from '../../features/SchedulePayment/SchedulePaymentSlice';

/* ─── Helper Components ─── */
const StatPill = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
  };
  return (
    <div className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${colors[color]}`}>
      <span className="opacity-70">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
};

const InfoCell = ({ label, value, highlight }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
    <p className={`font-semibold text-sm break-words ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>{value || '—'}</p>
  </div>
);

const FormField = ({ label, required, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const StatusChip = ({ status }) => {
  const map = {
    completed: { cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: '✓ Completed' },
    partial: { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: '◑ Partial' },
    pending: { cls: 'bg-red-100 text-red-700 border border-red-200', label: '⏳ Pending' },
  };
  const s = map[status] || { cls: 'bg-slate-100 text-slate-600', label: status || '—' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>
  );
};

/* ─── Main Component ─── */
const SchedulePayment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedBookingForAction, setSelectedBookingForAction] = useState(null);
  const [actionForm, setActionForm] = useState({
    status: '', remark: '', amountReceived: '', nextDate: '',
    lastDateOfReceiving: '', bankName: '', paymentMode: '', paymentDetails: '',
    gstPercent: '0', tdsAmount: '0'
  });

  const { data: payments = [], isLoading, isFetching, isError, error } = useGetSchedulePaymentsQuery();
  const [updateSchedulePayment, { isLoading: isUpdating }] = useUpdateSchedulePaymentMutation();
  const { data: bankMapping, isLoading: banksLoading } = useGetProjectBankMappingQuery(undefined, { refetchOnMountOrArgChange: true });

  const userType = sessionStorage.getItem('userType') || '';
  const isCRM = userType.trim().toUpperCase() === 'CRM';

  const isRefundStatus = (s) => s === 'refund';
  const isWorkNotDoneStatus = (s) => s === 'worknotdone';
  const isPaymentStatus = (s) => ['Done', 'partial', 'refund', 'worknotdone'].includes(s);

  const gstCalculation = useMemo(() => {
    const amount = parseFloat(actionForm.amountReceived) || 0;
    const tds = isWorkNotDoneStatus(actionForm.status) ? (parseFloat(actionForm.tdsAmount) || 0) : 0;
    const gstPercent = parseFloat(actionForm.gstPercent) || 0;
    const grossAmount = amount + tds;

    if (grossAmount <= 0) {
      return { cgst: 0, sgst: 0, totalGst: 0, netAmount: 0, tds: 0, grossAmount: 0 };
    }

    if (gstPercent <= 0) {
      return { cgst: 0, sgst: 0, totalGst: 0, netAmount: grossAmount, tds, grossAmount };
    }

    const netAmount = grossAmount / (1 + gstPercent / 100);
    const totalGst = grossAmount - netAmount;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;

    return {
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      tds,
      grossAmount: Math.round(grossAmount * 100) / 100
    };
  }, [actionForm.amountReceived, actionForm.gstPercent, actionForm.tdsAmount, actionForm.status]);

  const formatDate = (dateStr, forDisplay = false) => {
    const fallback = forDisplay ? '—' : '';
    if (!dateStr || dateStr === '—' || dateStr === '-') return fallback;
    const s = String(dateStr).trim();
    if (!s) return fallback;
    if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const [y, m, d] = s.split('-');
      return `${d}/${m}/${y}`;
    }
    if (/^\d{4}\/\d{2}\/\d{2}/.test(s)) {
      const [y, m, d] = s.split('/');
      return `${d}/${m}/${y}`;
    }
    return fallback;
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyShort = (amount) => {
    if (amount == null || isNaN(amount)) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const stripNum = (str) => Number(String(str || '').replace(/[^0-9.-]/g, '') || 0);

  const parseToDate = (dateStr) => {
    if (!dateStr || dateStr === '—' || dateStr === '-') return null;
    let d;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split('/');
      d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    } else if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [yyyy, mm, dd] = dateStr.split('-');
      d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    } else {
      d = new Date(dateStr);
    }
    return isNaN(d?.getTime()) ? null : d;
  };

  const isOverdue = (dateStr) => {
    const d = parseToDate(dateStr);
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isRefundPayment = (pay) => {
    const s = (pay?.status || '').toLowerCase().trim();
    const sAC = (pay?.statusAC || '').toLowerCase().trim();
    return s === 'refund' || s === 'refund payment' || sAC === 'refund' || sAC === 'refund payment';
  };

  const isWorkNotDonePayment = (pay) => {
    const s = (pay?.status || '').toLowerCase().trim();
    const sAC = (pay?.statusAC || '').toLowerCase().trim();
    return s === 'worknotdone' || s === 'work not done' || sAC === 'worknotdone' || sAC === 'work not done';
  };

  const getPaymentGrossAmount = (pay) => {
    const gross = parseFloat(pay?.grossAmount);
    if (!isNaN(gross) && gross > 0) return gross;
    for (const key of ['PreviousAmountV', 'PreviousAmount', 'amount', 'Amount', 'previousAmount', 'receivedAmount', 'amountReceived', 'paymentAmount', 'PreviousReceivedAmount']) {
      const val = pay?.[key];
      if (val != null && val !== '' && !isNaN(Number(val))) return Number(val);
    }
    return 0;
  };

  const getPreviousAmount = (pay) => {
    for (const key of ['PreviousAmountV', 'PreviousAmount', 'amount', 'Amount', 'previousAmount', 'receivedAmount', 'amountReceived', 'paymentAmount', 'PreviousReceivedAmount']) {
      const val = pay?.[key];
      if (val != null && val !== '' && !isNaN(Number(val))) return Number(val);
    }
    return 0;
  };

  const getLatestFollowUpInfo = (schedule) => {
    if (!schedule?.followUpHistory?.length) return { nextDate: schedule?.FollowUp || '—', count: '—', lastRemark: '—', lastStatus: '—' };
    const sorted = [...schedule.followUpHistory].sort((a, b) => new Date(b.timestamp || b.dateOfFollowup || 0) - new Date(a.timestamp || a.dateOfFollowup || 0));
    const latest = sorted[0];
    return { nextDate: latest.nextDateOfFollowup || schedule.FollowUp || '—', count: latest.followupCount || schedule.followUpHistory.length || '—', lastRemark: latest.remark || '—', lastStatus: latest.status || '—' };
  };

  const getNextFollowUpForBooking = (booking) => {
    let nextDate = '—'; let count = '—';
    for (const schedule of booking.schedules) {
      if (schedule.previousPayments?.length > 0) {
        const sortedPayments = [...schedule.previousPayments].sort((a, b) => {
          const dateA = parseToDate(a.previousReceviedAmountDate)?.getTime() || new Date(a.timestamp || 0).getTime();
          const dateB = parseToDate(b.previousReceviedAmountDate)?.getTime() || new Date(b.timestamp || 0).getTime();
          return dateB - dateA;
        });
        for (const payment of sortedPayments) {
          for (const field of ['NextDate', 'nextDate', 'next_date', 'nextFollowupDate']) {
            if (payment[field] && payment[field] !== '—' && payment[field] !== '-' && payment[field] !== '') {
              const fd = formatDate(payment[field], true);
              if (fd && fd !== '—') { nextDate = fd; count = sortedPayments.length; break; }
            }
          }
          if (nextDate !== '—') break;
        }
      }
      if (nextDate !== '—') break;
      if (schedule.followUpHistory?.length > 0) {
        const sorted = [...schedule.followUpHistory].sort((a, b) => new Date(b.timestamp || b.dateOfFollowup || 0) - new Date(a.timestamp || a.dateOfFollowup || 0));
        for (const fu of sorted) {
          if (fu.nextDateOfFollowup && fu.nextDateOfFollowup !== '—' && fu.nextDateOfFollowup !== '-' && fu.nextDateOfFollowup !== '') {
            const fd = formatDate(fu.nextDateOfFollowup, true);
            if (fd && fd !== '—') { nextDate = fd; count = fu.followupCount || sorted.length; break; }
          }
        }
      }
      if (nextDate !== '—') break;
      for (const field of ['NextDate', 'nextDate', 'nextDateOfFollowup', 'next_date', 'nextFollowupDate']) {
        if (schedule[field] && schedule[field] !== '—' && schedule[field] !== '-' && schedule[field] !== '' && schedule[field].toUpperCase() !== 'Y' && schedule[field].toUpperCase() !== 'N') {
          const fd = formatDate(schedule[field], true);
          if (fd && fd !== '—') { nextDate = fd; break; }
        }
      }
      if (nextDate !== '—') break;
    }
    return { nextDate, count };
  };

  const getScheduleTotalReceived = (sch) =>
    (sch.previousPayments || []).reduce(
      (s, p) => isRefundPayment(p) ? s : s + getPaymentGrossAmount(p), 0
    );

  const getScheduleTotalRefund = (sch) =>
    (sch.previousPayments || []).reduce(
      (s, p) => isRefundPayment(p) ? s + getPaymentGrossAmount(p) : s, 0
    );

  const getScheduleBalance = (sch) => {
    const schAmount = stripNum(sch.Amount);
    const received = getScheduleTotalReceived(sch);
    return Math.max(0, schAmount - received);
  };

  const getScheduleBalancesWithSpillover = (booking) => {
    const sortedSchedules = [...booking.schedules].sort((a, b) => {
      const dateA = parseToDate(a.Planned)?.getTime() || 0;
      const dateB = parseToDate(b.Planned)?.getTime() || 0;
      return dateA - dateB;
    });

    let carryForwardSurplus = 0;
    const balanceMap = new Map();

    for (const sch of sortedSchedules) {
      const schAmount = stripNum(sch.Amount);
      const directReceived = getScheduleTotalReceived(sch);
      const totalAvailable = directReceived + carryForwardSurplus;
      const balance = Math.max(0, schAmount - totalAvailable);
      const surplus = Math.max(0, totalAvailable - schAmount);
      const isComplete = balance <= 0;

      const key = sch.paymentId || sch.Planned || JSON.stringify(sch);
      balanceMap.set(key, { balance, isComplete, received: directReceived, effectiveReceived: Math.min(totalAvailable, schAmount), surplus });
      carryForwardSurplus = surplus;
    }

    return balanceMap;
  };

  const getScheduleKey = (sch) => sch.paymentId || sch.Planned || JSON.stringify(sch);

  const isScheduleComplete = (sch, booking) => {
    if (booking) {
      const balanceMap = getScheduleBalancesWithSpillover(booking);
      const key = getScheduleKey(sch);
      const info = balanceMap.get(key);
      if (info) return info.isComplete;
    }
    return getScheduleBalance(sch) <= 0;
  };

  const getEffectiveScheduleBalance = (sch, booking) => {
    if (booking) {
      const balanceMap = getScheduleBalancesWithSpillover(booking);
      const key = getScheduleKey(sch);
      const info = balanceMap.get(key);
      if (info) return info.balance;
    }
    return getScheduleBalance(sch);
  };

  const getBookingTotalReceived = (booking) =>
    booking.schedules.reduce((sum, sch) => sum + getScheduleTotalReceived(sch), 0);

  const getBookingTotalRefund = (booking) =>
    booking.schedules.reduce((sum, sch) => sum + getScheduleTotalRefund(sch), 0);

  const getNetReceived = (booking) => {
    const totalReceived = getBookingTotalReceived(booking);
    const totalRefund = getBookingTotalRefund(booking);
    return Math.max(0, totalReceived - totalRefund);
  };

  const getBookingTotalSurplus = (booking) => {
    const agrValue = stripNum(booking.agreementValue);
    const netReceived = getNetReceived(booking);
    return Math.max(0, netReceived - agrValue);
  };

  const getBookingBalanceDue = (booking) => {
    const agrValue = stripNum(booking.agreementValue);
    const netReceived = getNetReceived(booking);
    return Math.max(0, agrValue - netReceived);
  };

  const getBookingOverdueDue = (booking) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const balanceMap = getScheduleBalancesWithSpillover(booking);
    return booking.schedules.reduce((sum, sch) => {
      const plannedDate = parseToDate(sch.Planned);
      const key = getScheduleKey(sch);
      const info = balanceMap.get(key);
      const balance = info ? info.balance : getScheduleBalance(sch);
      if (plannedDate && plannedDate < today && balance > 0) return sum + balance;
      return sum;
    }, 0);
  };

  const getEarliestPendingPlanned = (booking) => {
    const balanceMap = getScheduleBalancesWithSpillover(booking);
    const pendingScheds = booking.schedules.filter(s => {
      const key = getScheduleKey(s);
      const info = balanceMap.get(key);
      return info ? !info.isComplete : getScheduleBalance(s) > 0;
    });
    if (!pendingScheds.length) return null;
    const sorted = pendingScheds.map(s => s.Planned).filter(Boolean).sort((a, b) => {
      const toMs = ds => { const d = parseToDate(ds); return d ? d.getTime() : 0; };
      return toMs(a) - toMs(b);
    });
    return sorted[0] || null;
  };

  const getBookingStatus = (booking) => {
    const balanceMap = getScheduleBalancesWithSpillover(booking);
    let pendingCount = 0;
    for (const sch of booking.schedules) {
      const key = getScheduleKey(sch);
      const info = balanceMap.get(key);
      const isComplete = info ? info.isComplete : getScheduleBalance(sch) <= 0;
      if (!isComplete) pendingCount++;
    }
    if (pendingCount === 0) return 'completed';
    if (pendingCount === booking.schedules.length) return 'pending';
    return 'partial';
  };

  const isBookingOverdue = (booking) => {
    if (getBookingStatus(booking) === 'completed') return false;
    const earliestPlanned = getEarliestPendingPlanned(booking);
    const plannedOverdue = earliestPlanned ? isOverdue(earliestPlanned) : false;
    const fuData = getNextFollowUpForBooking(booking);
    const nextFuOverdue = fuData.nextDate && fuData.nextDate !== '—' ? isOverdue(fuData.nextDate) : false;
    return plannedOverdue || nextFuOverdue;
  };

  const groupedBookings = useMemo(() => {
    const groups = {};
    payments.forEach(payment => {
      const bookingId = payment.bookingId?.trim();
      if (!bookingId) return;
      if (!groups[bookingId]) {
        groups[bookingId] = {
          bookingId,
          applicantName: payment.applicantName || '—',
          unitNo: payment.unitNo || '—',
          unitCode: payment.unitCode || '—',
          block: payment.block || '—',
          unitType: payment.unitType || '—',
          size: payment.size || '—',
          Project: payment.Project || '—',
          contact: payment.contact || '—',
          email: payment.email || '—',
          CurrentAddress: payment.CurrentAddress || '—',
          agreementValue: stripNum(payment.agreementValue),
          bookingAmount: stripNum(payment.bookingAmount),
          balanceToReceive: stripNum(payment.BalanceToRecive),
          surPlusAmount: stripNum(payment.SurPlusAmount),
          schedules: []
        };
      }
      groups[bookingId].schedules.push(payment);
    });
    return Object.values(groups);
  }, [payments]);

  const projectList = useMemo(() => {
    const set = new Set(groupedBookings.map(b => b.Project).filter(p => p && p !== '—'));
    return [...set].sort();
  }, [groupedBookings]);

  const isDateInRange = (dateStr, from, to) => {
    const target = parseToDate(dateStr);
    if (!target) return false;
    if (!from && !to) return true;
    const start = from ? new Date(from) : new Date(0);
    const end = to ? new Date(to) : new Date(8640000000000000);
    start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
    return target >= start && target <= end;
  };

  const overdueCount = useMemo(() => groupedBookings.filter(b => isBookingOverdue(b)).length, [groupedBookings]);

  const filteredBookings = useMemo(() => {
    let result = groupedBookings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => [b.applicantName, b.bookingId, b.unitNo, b.unitCode, b.block, b.contact, b.email, b.Project].some(f => String(f || '').toLowerCase().includes(q)));
    }
    if (filterProject) result = result.filter(b => b.Project === filterProject);
    if (filterOverdue) result = result.filter(b => isBookingOverdue(b));
    if (fromDate || toDate) {
      result = result.filter(booking => {
        const hasMatchingSchedule = booking.schedules.some(sch => {
          const plannedMatch = isDateInRange(formatDate(sch.Planned), fromDate, toDate);
          const fuInfo = getLatestFollowUpInfo(sch);
          return plannedMatch || isDateInRange(fuInfo.nextDate, fromDate, toDate);
        });
        return hasMatchingSchedule || isDateInRange(getNextFollowUpForBooking(booking).nextDate, fromDate, toDate);
      });
    }
    return result;
  }, [groupedBookings, searchQuery, filterProject, filterOverdue, fromDate, toDate]);

  const filteredOverdueAmount = useMemo(() => filteredBookings.reduce((sum, b) => sum + getBookingOverdueDue(b), 0), [filteredBookings]);
  const filteredTotalReceived = useMemo(() => filteredBookings.reduce((sum, b) => sum + getBookingTotalReceived(b), 0), [filteredBookings]);

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => setCurrentPage(1), [searchQuery, filterProject, filterOverdue, fromDate, toDate, isCRM]);

  useEffect(() => {
    if (selectedBooking && groupedBookings.length > 0) {
      const updated = groupedBookings.find(b => b.bookingId === selectedBooking.bookingId);
      if (updated) setSelectedBooking(updated);
    }
  }, [groupedBookings, selectedBooking]);

  const stats = useMemo(() => ({
    total: groupedBookings.length,
    completed: groupedBookings.filter(b => getBookingStatus(b) === 'completed').length,
    pending: groupedBookings.filter(b => getBookingStatus(b) === 'pending').length,
    partial: groupedBookings.filter(b => getBookingStatus(b) === 'partial').length,
  }), [groupedBookings]);

  const openDetailModal = (booking) => { setSelectedBooking(booking); setShowDetailModal(true); };

  const openActionModal = (payment, e, booking) => {
    e?.stopPropagation();
    setSelectedPayment(payment);
    setSelectedBookingForAction(booking || null);
    setActionForm({
      status: isCRM ? 'pending' : '',
      remark: '', amountReceived: '', nextDate: '',
      lastDateOfReceiving: '', bankName: '', paymentMode: '', paymentDetails: '',
      gstPercent: '0', tdsAmount: '0'
    });
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedPayment(null);
    setSelectedBookingForAction(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setActionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAction = async () => {
    if (!actionForm.status) { alert("Status select karna zaroori hai"); return; }
    if (isCRM && actionForm.status !== 'pending') { alert("CRM users sirf Pending status use kar sakte hain"); return; }

    const paymentStatuses = ['Done', 'partial', 'refund', 'worknotdone'];
    const isPayment = paymentStatuses.includes(actionForm.status);

    if (isPayment && (!actionForm.amountReceived || Number(actionForm.amountReceived) <= 0)) {
      alert("Amount daalna zaroori hai aur 0 se zyada hona chahiye"); return;
    }
    if (isPayment && !actionForm.lastDateOfReceiving?.trim()) {
      alert("Date bharein — yeh zaroori hai"); return;
    }
    if (isPayment && (!actionForm.bankName?.trim() || !actionForm.paymentMode?.trim())) {
      alert("Bank Name aur Payment Mode dono bharein"); return;
    }
    if (actionForm.status === 'pending' && (!actionForm.nextDate || !actionForm.remark?.trim())) {
      alert("Pending ke liye Next Date aur Remark dono bharein"); return;
    }
    if (isRefundStatus(actionForm.status) && !actionForm.remark?.trim()) {
      alert("Refund ka reason likhna zaroori hai"); return;
    }

    try {
      const grossAmount = isWorkNotDoneStatus(actionForm.status)
        ? gstCalculation.grossAmount.toString()
        : actionForm.amountReceived || '';

      await updateSchedulePayment({
        paymentId: selectedPayment?.paymentId?.trim() || '',
        status: actionForm.status,
        lastDateOfReceiving: actionForm.lastDateOfReceiving ? formatDate(actionForm.lastDateOfReceiving) : '',
        nextDate: formatDate(actionForm.nextDate),
        amountReceived: grossAmount,
        remark: actionForm.remark?.trim() || '',
        bankName: (actionForm.bankName === '—' ? '' : actionForm.bankName?.trim()) || '',
        paymentMode: actionForm.paymentMode?.trim() || '',
        paymentDetails: actionForm.paymentDetails?.trim() || '',
        Planned: formatDate(selectedPayment?.Planned),
        bookingId: selectedPayment?.bookingId || '',
        applicantName: selectedPayment?.applicantName || '',
        contact: selectedPayment?.contact || '',
        email: selectedPayment?.email || '',
        CurrentAddress: selectedPayment?.CurrentAddress || '',
        agreementValue: selectedPayment?.agreementValue || '',
        bookingAmount: selectedPayment?.bookingAmount || '',
        unitCode: selectedPayment?.unitCode || '',
        block: selectedPayment?.block || '',
        unitNo: selectedPayment?.unitNo || '',
        unitType: selectedPayment?.unitType || '',
        size: selectedPayment?.size || '',
        Project_Name: selectedPayment?.Project || '',
        Date: formatDate(selectedPayment?.Date),
        gstPercent: actionForm.gstPercent || '0',
        cgst: gstCalculation.cgst.toString(),
        sgst: gstCalculation.sgst.toString(),
        netAmount: gstCalculation.netAmount.toString(),
        tdsAmount: isWorkNotDoneStatus(actionForm.status) ? (actionForm.tdsAmount || '0') : '0'
      }).unwrap();

      let successMsg = "Successfully updated!";
      if (isRefundStatus(actionForm.status)) successMsg = "Refund successfully recorded!";
      if (isWorkNotDoneStatus(actionForm.status)) successMsg = "Work Not Done recorded successfully!";

      alert(successMsg);
      closeActionModal();
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + (err?.data?.message || err?.message || "Unknown error"));
    }
  };

  if (isLoading || isFetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
        <p className="mt-4 text-slate-500 font-medium">Loading payment schedules...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md w-full">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Data load nahi hua</h2>
        <p className="text-slate-500 mb-6">{error?.data?.error || error?.message || 'Something went wrong'}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <IndianRupee className="text-blue-600" size={22} />
              Payment Schedule Dashboard
              {isCRM && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">CRM View</span>}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">{isCRM ? 'View and manage pending payment follow-ups' : 'Track and manage all unit payment schedules'}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatPill label="Total" value={stats.total} color="blue" />
            <StatPill label="Completed" value={stats.completed} color="green" />
            <StatPill label="Partial" value={stats.partial} color="amber" />
            <StatPill label="Pending" value={stats.pending} color="red" />
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-5 space-y-4">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input type="text" placeholder="Search by name, booking ID, unit, contact, email, project..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
              <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white cursor-pointer appearance-none">
                <option value="">All Projects</option>
                {projectList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={() => setFilterOverdue(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition whitespace-nowrap ${filterOverdue ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}>
              <AlertTriangle size={14} /> Overdue Dues
              {overdueCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filterOverdue ? 'bg-white text-red-600' : 'bg-red-100 text-red-700'}`}>{overdueCount}</span>
              )}
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white" title="From Date" />
              </div>
              <span className="text-slate-400 text-xs font-medium">to</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white" title="To Date" />
              </div>
              {(fromDate || toDate) && (
                <button onClick={() => { setFromDate(''); setToDate(''); }}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 transition" title="Clear date filter">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p className="text-xs text-slate-500">Showing <strong className="text-slate-700">{filteredBookings.length}</strong> of <strong>{groupedBookings.length}</strong> bookings</p>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="opacity-70">Filtered Overdue Total</span>
                <span className="text-lg font-black">{formatCurrencyShort(filteredOverdueAmount)}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <span className="opacity-70">Filtered Total Received</span>
                <span className="text-lg font-black">{formatCurrencyShort(filteredTotalReceived)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white text-xs uppercase tracking-wide h-12">
                  {["#", "Planned Date", "Applicant Name", "Booking ID", "Project", "Unit No", "Block", "Unit Type", "Contact", "Agr. Value", "Total Received", "Surplus", "Balance Due", "Overdue Due", "Schedules", "Pending", "Next Follow-up", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-4 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBookings.length === 0 ? (
                  <tr><td colSpan={19} className="py-20 text-center"><Search size={36} className="mx-auto mb-3 text-slate-300" /><p className="font-medium text-slate-500">No bookings found</p><p className="text-xs text-slate-400 mt-1">Try changing your search or filters</p></td></tr>
                ) : paginatedBookings.map((booking, idx) => {
                  const status = getBookingStatus(booking);
                  const balanceMap = getScheduleBalancesWithSpillover(booking);
                  const total = booking.schedules.length;
                  const pendingCount = booking.schedules.filter(s => {
                    const key = getScheduleKey(s);
                    const info = balanceMap.get(key);
                    return info ? !info.isComplete : getScheduleBalance(s) > 0;
                  }).length;
                  const followUpData = getNextFollowUpForBooking(booking);
                  const fuInfo = { nextDate: followUpData.nextDate, count: followUpData.count };
                  const rowNum = (currentPage - 1) * rowsPerPage + idx + 1;
                  const earliestPlanned = getEarliestPendingPlanned(booking);
                  const plannedOverdue = earliestPlanned ? isOverdue(earliestPlanned) : false;
                  const nextFuOverdue = fuInfo.nextDate && fuInfo.nextDate !== '—' ? isOverdue(fuInfo.nextDate) : false;
                  const isHighlighted = status !== 'completed' && (plannedOverdue || nextFuOverdue);
                  const totalReceived = getBookingTotalReceived(booking);
                  const totalSurplus = getBookingTotalSurplus(booking);
                  const balanceDue = getBookingBalanceDue(booking);
                  const overdueDue = getBookingOverdueDue(booking);
                  const totalRefund = getBookingTotalRefund(booking);

                  return (
                    <tr key={booking.bookingId} className={`transition-colors cursor-pointer ${isHighlighted ? 'bg-red-50 hover:bg-red-100/60' : 'hover:bg-blue-50/40'}`} onClick={() => openDetailModal(booking)}>
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-medium whitespace-nowrap">{rowNum}</td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        {earliestPlanned ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-semibold ${plannedOverdue && status !== 'completed' ? 'bg-orange-100 text-orange-700' : 'text-slate-600'}`}>
                            {plannedOverdue && status !== 'completed' && <span title="Overdue">!</span>}{earliestPlanned}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-sm">{booking.applicantName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{booking.email !== '—' ? booking.email : booking.contact}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap"><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{booking.bookingId}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">{booking.Project}</span></td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium text-sm whitespace-nowrap">{booking.unitNo}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-sm whitespace-nowrap">{booking.block}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-sm whitespace-nowrap">{booking.unitType}</td>
                      <td className="px-4 py-3.5 text-slate-600 text-sm whitespace-nowrap">{booking.contact}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap"><div className="font-semibold text-slate-800 text-sm">{formatCurrencyShort(booking.agreementValue)}</div></td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="font-semibold text-emerald-700 text-sm">{formatCurrencyShort(totalReceived)}</div>
                        {totalRefund > 0 && (
                          <div className="text-[11px] text-orange-600 font-semibold mt-0.5">
                            <span className="flex items-center justify-end gap-0.5"><ArrowDownLeft size={10} />−{formatCurrencyShort(totalRefund)}</span>
                            <span className="text-[10px] text-amber-600">Net: {formatCurrencyShort(getNetReceived(booking))}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {totalSurplus > 0 ? <span className="inline-flex items-center gap-0.5 font-semibold text-teal-700 text-sm"><TrendingUp size={12} />{formatCurrencyShort(totalSurplus)}</span> : <span className="text-slate-400 text-sm">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-amber-700 text-sm whitespace-nowrap">{formatCurrencyShort(balanceDue)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-red-700 text-sm whitespace-nowrap">{formatCurrencyShort(overdueDue)}</td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">{total}</span></td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {pendingCount > 0 ? <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">{pendingCount}</span> : <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">0</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap font-medium">
                        {fuInfo.nextDate && fuInfo.nextDate !== '—' ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-semibold ${nextFuOverdue ? 'bg-red-100 text-red-700' : 'text-purple-700 bg-purple-50'}`}>
                            {nextFuOverdue && <span title="Overdue">⚠</span>}{fuInfo.nextDate}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap"><StatusChip status={status} /></td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openDetailModal(booking)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition" title="View Details"><Eye size={14} /></button>
                          {balanceDue > 0 && (
                            <button onClick={e => {
                              const firstPending = booking.schedules.find(s => {
                                const key = getScheduleKey(s);
                                const info = balanceMap.get(key);
                                return info ? !info.isComplete : getScheduleBalance(s) > 0;
                              });
                              openActionModal(firstPending || booking.schedules[0], e, booking);
                            }} disabled={isUpdating} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition disabled:opacity-50" title="Take Action"><Edit3 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <p className="text-xs text-slate-500">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> — <strong>{filteredBookings.length}</strong> results</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-start justify-center p-4 pt-8 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mb-10">
            <div className="sticky top-0 z-10 bg-slate-900 p-5 rounded-t-2xl text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{selectedBooking.applicantName}</h2>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-xs text-slate-300">
                    <span><span className="opacity-60">Booking: </span><span className="font-mono font-bold text-white">{selectedBooking.bookingId}</span></span>
                    <span><span className="opacity-60">Project: </span><span className="font-bold text-white">{selectedBooking.Project}</span></span>
                    <span><span className="opacity-60">Unit: </span><span className="font-bold text-white">{selectedBooking.unitNo}</span></span>
                    <span className="flex items-center gap-1"><Phone size={10} /> {selectedBooking.contact}</span>
                    <span className="flex items-center gap-1"><Mail size={10} /> {selectedBooking.email}</span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition ml-4 flex-shrink-0"><X size={20} /></button>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <InfoCell label="Unit Code" value={selectedBooking.unitCode} />
                <InfoCell label="Block" value={selectedBooking.block} />
                <InfoCell label="Unit Type" value={selectedBooking.unitType} />
                <InfoCell label="Size" value={selectedBooking.size} />
                <InfoCell label="Agreement Value" value={formatCurrencyShort(selectedBooking.agreementValue)} highlight />
                <InfoCell label="Booking Amount (Ignored)" value={formatCurrencyShort(selectedBooking.bookingAmount)} />
              </div>
              {selectedBooking.CurrentAddress !== '—' && (
                <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />{selectedBooking.CurrentAddress}
                </div>
              )}
            </div>

            {(() => {
              const originalAgrValue = stripNum(selectedBooking.agreementValue);
              const totalReceived = getBookingTotalReceived(selectedBooking);
              const totalRefund = getBookingTotalRefund(selectedBooking);
              const totalSurplus = getBookingTotalSurplus(selectedBooking);
              const netReceived = getNetReceived(selectedBooking);
              const balanceDue = getBookingBalanceDue(selectedBooking);
              const overdueDue = getBookingOverdueDue(selectedBooking);
              const pct = originalAgrValue > 0 ? Math.round((Math.min(netReceived, originalAgrValue) / originalAgrValue) * 100) : 0;
              const hasRefund = totalRefund > 0;
              const hasSurplus = totalSurplus > 0;

const localBalanceMap = getScheduleBalancesWithSpillover(selectedBooking);
const totalScheduleAmount = selectedBooking.schedules.reduce((sum, sch) => {
  const key = getScheduleKey(sch);
  const info = localBalanceMap.get(key);
  const balance = info ? info.balance : getScheduleBalance(sch);
  const plannedDate = parseToDate(sch.Planned);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdueSchedule = plannedDate && plannedDate < today && balance > 0;
  return isOverdueSchedule ? sum + stripNum(sch.Amount) : sum;
}, 0);

              return (
                <div className="mx-5 mb-0 mt-4 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-700 px-5 py-2.5 flex items-center gap-2">
                    <IndianRupee size={14} className="text-slate-300" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">Payment Summary</span>
                    <span className="ml-auto text-xs text-slate-300">{pct}% collected</span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex divide-x divide-slate-100 bg-white w-full min-w-max">

                      {/* Agreement Value */}
                      <div className="px-4 py-3 flex-1 min-w-[130px]">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Agreement Value</p>
                        <p className="font-bold text-slate-800 text-sm">{formatCurrencyShort(originalAgrValue)}</p>
                      </div>

                      {/* ✅ NEW: Total Schedule Amount Box */}
                      <div className="px-4 py-3 bg-violet-50 flex-1 min-w-[150px]">
                        <p className="text-xs text-violet-600 font-medium uppercase tracking-wide mb-1">Pending Schedule Amount</p>
                        <p className="font-black text-violet-700 text-base">{formatCurrencyShort(totalScheduleAmount)}</p>
                        <p className="text-[10px] text-violet-500 mt-0.5">Sum of all schedules</p>
                      </div>

                      {/* Total Received */}
                      <div className="px-4 py-3 bg-emerald-50 flex-1 min-w-[140px]">
                        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Total Received</p>
                        <p className="font-black text-emerald-700 text-base">{formatCurrencyShort(totalReceived)}</p>
                        <p className="text-[10px] text-emerald-500 mt-0.5">Gross amount across schedules</p>
                      </div>

                      {hasRefund && (
                        <div className="px-4 py-3 bg-orange-50 flex-1 min-w-[140px]">
                          <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><ArrowDownLeft size={11} /> Total Refunded</p>
                          <p className="font-black text-orange-700 text-base">−{formatCurrencyShort(totalRefund)}</p>
                          <p className="text-[10px] text-orange-400 mt-0.5">Deducted from received</p>
                        </div>
                      )}

                      <div className="px-4 py-3 bg-green-50 flex-1 min-w-[140px]">
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Net Received</p>
                        <p className="font-black text-green-700 text-base">{formatCurrencyShort(netReceived)}</p>
                        <p className="text-[10px] text-green-500 mt-0.5">Received - Refund</p>
                      </div>

                      {hasSurplus && (
                        <div className="px-4 py-3 bg-teal-50 flex-1 min-w-[130px]">
                          <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><TrendingUp size={11} /> Total Surplus</p>
                          <p className="font-black text-teal-700 text-base">{formatCurrencyShort(totalSurplus)}</p>
                          <p className="text-[10px] text-teal-500 mt-0.5">Above agreement value</p>
                        </div>
                      )}

                      <div className="px-4 py-3 bg-red-50 flex-1 min-w-[130px]">
                        <p className="text-xs text-red-500 font-medium uppercase tracking-wide mb-1">Overdue Due</p>
                        <p className="font-black text-red-700 text-base">{formatCurrencyShort(overdueDue)}</p>
                        <p className="text-[10px] text-red-400 mt-0.5">Past planned dates</p>
                      </div>

                      <div className="px-4 py-3 bg-amber-50 flex-1 min-w-[140px]">
                        <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">Balance Due</p>
                        <p className="font-black text-amber-700 text-base">{formatCurrencyShort(balanceDue)}</p>
                        <p className="text-[10px] text-amber-500 mt-0.5">Agreement - Net Received</p>
                      </div>

                    </div>
                  </div>
                  <div className="h-2 bg-slate-100">
                    <div className="h-2 bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })()}

            <div className="p-5 space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={17} className="text-blue-600" />
                Payment Schedules ({selectedBooking.schedules.length})
              </h3>

              {(() => {
                const balanceMap = getScheduleBalancesWithSpillover(selectedBooking);
                return selectedBooking.schedules.map((sch, i) => {
                  const schAmount = stripNum(sch.Amount);
                  const totalReceivedSch = getScheduleTotalReceived(sch);
                  const totalRefundSch = getScheduleTotalRefund(sch);
                  const key = getScheduleKey(sch);
                  const spilloverInfo = balanceMap.get(key);
                  const balance = spilloverInfo ? spilloverInfo.balance : getScheduleBalance(sch);
                  const isComplete = spilloverInfo ? spilloverInfo.isComplete : balance <= 0;
                  const spilloverSurplus = spilloverInfo?.surplus || 0;
                  const isScheduleOverdue = isOverdue(sch.Planned) && !isComplete;
                  const hasPrev = sch.previousPayments?.length > 0;
                  const hasFU = sch.followUpHistory?.length > 0;
                  const sortedFU = hasFU ? [...sch.followUpHistory].sort((a, b) => new Date(b.timestamp || b.dateOfFollowup || 0) - new Date(a.timestamp || a.dateOfFollowup || 0)) : [];
                  const fuInfo = getLatestFollowUpInfo(sch);

                  return (
                    <div key={i} className={`rounded-xl border-2 overflow-hidden shadow-sm ${isComplete ? 'border-emerald-200' : isScheduleOverdue ? 'border-red-300' : 'border-slate-200'}`}>
                      <div className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 ${isComplete ? 'bg-emerald-50' : isScheduleOverdue ? 'bg-red-50' : 'bg-slate-50'} border-b border-slate-200`}>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-bold text-slate-800">Schedule #{i + 1}</span>
                          <span className="text-slate-400">|</span>
                          <span className={`text-slate-600 ${isScheduleOverdue ? 'text-red-600' : ''}`}>
                            Planned: <strong className={isScheduleOverdue ? 'text-red-700' : 'text-slate-800'}>{formatDate(sch.Planned, true)}</strong>
                            {isScheduleOverdue && <span className="ml-1 text-red-600 text-xs">(Overdue!)</span>}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500 text-xs font-medium">Schedule Amount:</span>
                          <span className="font-bold text-blue-700">{formatCurrencyShort(schAmount)}</span>
                          <span className="text-slate-400">|</span>
                          {isComplete ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> Fully Received</span>
                          ) : (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isScheduleOverdue ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'}`}>
                              Balance: {formatCurrencyShort(balance)}
                            </span>
                          )}
                          {totalRefundSch > 0 && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                                <ArrowDownLeft size={11} />Refunded: {formatCurrencyShort(totalRefundSch)}
                              </span>
                            </>
                          )}
                          {isComplete && spilloverSurplus > 0 && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                                <TrendingUp size={11} />Surplus: {formatCurrencyShort(spilloverSurplus)} → Next Schedule
                              </span>
                            </>
                          )}
                        </div>
                        {balance > 0 && (
                          <button onClick={e => openActionModal(sch, e, selectedBooking)} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 flex-shrink-0">
                            <Edit3 size={12} /> Take Action
                          </button>
                        )}
                      </div>

                      <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-5 gap-4 bg-white border-b border-slate-100 text-xs">
                        <div><p className="text-slate-400 mb-0.5">Payment ID</p><p className="font-mono font-semibold text-slate-700">{sch.paymentId || '—'}</p></div>
                        <div><p className="text-slate-400 mb-0.5">Total Received</p><p className="font-bold text-emerald-700">{totalReceivedSch > 0 ? formatCurrencyShort(totalReceivedSch) : '—'}</p></div>
                        <div><p className="text-slate-400 mb-0.5">Balance</p><p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{balance > 0 ? formatCurrencyShort(balance) : '₹0'}</p></div>
                        <div><p className="text-slate-400 mb-0.5">Refunded</p><p className={`font-bold ${totalRefundSch > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{totalRefundSch > 0 ? `−${formatCurrencyShort(totalRefundSch)}` : '—'}</p></div>
                        <div><p className="text-slate-400 mb-0.5">Next Follow-up</p><p className="font-bold text-purple-700">{fuInfo.nextDate}</p></div>
                      </div>

                      {/* Payment History Table */}
                      <div className="border-b border-slate-100">
                        <div className="px-5 py-2.5 bg-blue-700 flex items-center gap-2">
                          <DollarSign size={13} className="text-blue-200" />
                          <span className="text-xs font-bold text-white uppercase tracking-wide">
                            Payment Received History — {sch.previousPayments?.length || 0} {(sch.previousPayments?.length || 0) === 1 ? 'Entry' : 'Entries'}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-blue-50 text-blue-900 border-b border-blue-100">
                                <th className="px-4 py-2.5 text-left font-semibold w-10">#</th>
                                <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Date</th>
                                <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Gross Amount</th>
                                <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">CGST</th>
                                <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">SGST</th>
                                <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Net Amount</th>
                                <th className="px-4 py-2.5 text-center font-semibold whitespace-nowrap">Status</th>
                                <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">TDS / Next F/U</th>
                                <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Remark</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {!hasPrev ? (
                                <tr><td colSpan={9} className="px-5 py-4 text-center text-xs text-slate-400">No payment received yet for this schedule.</td></tr>
                              ) : sch.previousPayments.map((pay, pi) => {
                                const netAmt = getPreviousAmount(pay);
                                const grossAmt = parseFloat(pay.grossAmount) || 0;
                                const cgst = parseFloat(pay.cgst) || 0;
                                const sgst = parseFloat(pay.sgst) || 0;
                                const payStatus = (pay.status || '').toLowerCase();
                                const isDoneStatus = ['done', 'completed', 'paid', 'complete'].includes(payStatus);
                                const isRefund = isRefundPayment(pay);
                                const isWND = isWorkNotDonePayment(pay);
                                return (
                                  <tr key={pi} className={`transition-colors ${isRefund ? 'bg-orange-50/70 hover:bg-orange-50' : isWND ? 'bg-yellow-50/70 hover:bg-yellow-50' : 'hover:bg-blue-50/30'}`}>
                                    <td className="px-4 py-2.5 text-slate-400 font-medium whitespace-nowrap">{pi + 1}</td>
                                    <td className="px-4 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                                      {formatDate(pay.previousReceviedAmountDate, true)}
                                      {isRefund && <span className="ml-1.5 bg-orange-200 text-orange-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">REFUND</span>}
                                      {isWND && <span className="ml-1.5 bg-yellow-200 text-yellow-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">WND</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                      <span className={`font-bold ${isRefund ? 'text-orange-600' : grossAmt > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {isRefund ? `−${formatCurrencyShort(grossAmt)}` : formatCurrencyShort(grossAmt)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap"><span className={`font-semibold ${isRefund ? 'text-orange-400 line-through' : 'text-orange-600'}`}>{formatCurrencyShort(cgst)}</span></td>
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap"><span className={`font-semibold ${isRefund ? 'text-orange-400 line-through' : 'text-purple-600'}`}>{formatCurrencyShort(sgst)}</span></td>
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                      <span className={`font-bold ${isRefund ? 'text-orange-700' : netAmt > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                        {isRefund ? `−${formatCurrencyShort(netAmt)}` : formatCurrencyShort(netAmt)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                                      {isRefund ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap bg-orange-100 text-orange-700 border border-orange-200"><ArrowDownLeft size={10} /> Refund</span>
                                      ) : isWND ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap bg-yellow-100 text-yellow-700 border border-yellow-200"><FileText size={10} /> Work Not Done</span>
                                      ) : (
                                        <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap ${isDoneStatus ? 'bg-emerald-100 text-emerald-700' : payStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                          {isDoneStatus ? '✓ Done' : payStatus === 'partial' ? '◑ Partial' : pay.status || '—'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 text-purple-700 font-medium whitespace-nowrap">
                                      {isWND ? <span className="text-yellow-700 flex items-center gap-1"><span className="text-[10px] text-yellow-500 font-bold">TDS:</span>{pay.NextDate || '—'}</span> : formatDate(pay.NextDate, true)}
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-500 max-w-xs">{pay.previousRemark || '—'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Follow-up History */}
                      {hasFU ? (
                        <div>
                          <div className="px-5 py-2.5 bg-purple-700 flex items-center gap-2">
                            <MessageSquare size={13} className="text-purple-200" />
                            <span className="text-xs font-bold text-white uppercase tracking-wide">Follow-up History — {sortedFU.length} Follow-up{sortedFU.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-purple-50 text-purple-900 border-b border-purple-100">
                                  <th className="px-4 py-2.5 text-left font-semibold w-16"># / Tag</th>
                                  <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Follow-up Date</th>
                                  <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Next Follow-up Date</th>
                                  <th className="px-4 py-2.5 text-center font-semibold whitespace-nowrap">Follow-up No.</th>
                                  <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Remark / Notes</th>
                                  <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {sortedFU.map((fu, fi) => {
                                  const isLatest = fi === 0;
                                  const fuStatus = fu.status?.toLowerCase() || '';
                                  return (
                                    <tr key={fi} className={`transition-colors ${isLatest ? 'bg-purple-50/50' : 'hover:bg-purple-50/20'}`}>
                                      <td className="px-4 py-3 align-top whitespace-nowrap">
                                        <span className="text-slate-400 font-medium">{sortedFU.length - fi}</span>
                                        {isLatest && <span className="ml-1.5 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold align-middle">LATEST</span>}
                                      </td>
                                      <td className="px-4 py-3 align-top whitespace-nowrap"><div className="flex items-center gap-1.5 font-semibold text-slate-700"><Clock size={10} className="text-slate-400 flex-shrink-0" />{formatDate(fu.dateOfFollowup, true)}</div></td>
                                      <td className="px-4 py-3 align-top font-semibold text-purple-700 whitespace-nowrap">{formatDate(fu.nextDateOfFollowup, true)}</td>
                                      <td className="px-4 py-3 text-center align-top whitespace-nowrap"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">{fu.followupCount || '—'}</span></td>
                                      <td className="px-4 py-3 text-slate-600 align-top leading-relaxed max-w-sm">{fu.remark || '—'}</td>
                                      <td className="px-4 py-3 align-top whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap ${fuStatus === 'done' || fuStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : fuStatus === 'pending' ? 'bg-orange-100 text-orange-700' : fuStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                          {fu.status || '—'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-5 bg-white flex items-center gap-2 text-xs text-slate-400">
                          <MessageSquare size={14} className="text-slate-300" />No follow-up records yet for this schedule.
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Action Modal ─── */}
      {showActionModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-5 rounded-t-2xl text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2"><Edit3 size={18} /> Take Action
                  {isCRM && <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">CRM</span>}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{selectedPayment.applicantName} • {selectedPayment.unitNo} • {selectedPayment.bookingId}</p>
              </div>
              <button onClick={closeActionModal} disabled={isUpdating} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-5">
              {(() => {
                const schAmount = stripNum(selectedPayment.Amount);
                const alreadyRec = getScheduleTotalReceived(selectedPayment);
                const booking = selectedBookingForAction;
                let stillDue = Math.max(0, schAmount - alreadyRec);
                if (booking) stillDue = getEffectiveScheduleBalance(selectedPayment, booking);
                const pct = schAmount > 0 ? Math.round((Math.min(alreadyRec, schAmount) / schAmount) * 100) : 0;
                const bookingSurplus = booking ? getBookingTotalSurplus(booking) : 0;

                return (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-700 px-4 py-2 flex items-center gap-2">
                      <IndianRupee size={13} className="text-slate-300" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">Schedule Payment Summary</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-slate-100 bg-white">
                      <div className="px-4 py-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Booking ID</p>
                        <p className="font-mono font-bold text-slate-800 text-sm">{selectedPayment.bookingId}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Unit: {selectedPayment.unitNo}</p>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Schedule Amount</p>
                        <p className="font-bold text-blue-700 text-sm">{formatCurrencyShort(schAmount)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Planned: {formatDate(selectedPayment.Planned, true)}</p>
                      </div>
                      <div className="px-4 py-3 bg-emerald-50">
                        <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Already Received</p>
                        <p className="font-black text-emerald-700 text-base">{formatCurrencyShort(alreadyRec)}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{pct}% of this schedule</p>
                      </div>
                      <div className="px-4 py-3 bg-red-50">
                        <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Still Due</p>
                        <p className="font-black text-red-700 text-base">{formatCurrencyShort(stillDue)}</p>
                        <p className="text-xs text-red-500 mt-0.5">Remaining in this schedule</p>
                      </div>
                      <div className={`px-4 py-3 ${bookingSurplus > 0 ? 'bg-teal-50' : ''}`}>
                        <p className="text-xs text-teal-600 uppercase tracking-wide mb-1 flex items-center gap-1"><TrendingUp size={10} /> Booking Surplus</p>
                        <p className={`font-black text-base ${bookingSurplus > 0 ? 'text-teal-700' : 'text-slate-400'}`}>{bookingSurplus > 0 ? formatCurrencyShort(bookingSurplus) : '₹0'}</p>
                        <p className="text-xs text-teal-500 mt-0.5">Agreement value based</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100"><div className="h-1.5 bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                  </div>
                );
              })()}

              {isCRM && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800"><p className="font-semibold">CRM Access</p><p className="text-xs mt-0.5">Aap sirf Pending status ke saath follow-up add kar sakte hain.</p></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Status" required>
                  <select name="status" value={actionForm.status} onChange={handleFormChange} disabled={isUpdating || isCRM}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                    <option value="">Select Status</option>
                    {!isCRM && <option value="partial">◑ Partial Payment</option>}
                    {!isCRM && <option value="refund">↩ Refund Payment</option>}
                    {!isCRM && <option value="worknotdone">📝 Work Not Done</option>}
                    <option value="pending">⏳ Pending</option>
                  </select>
                </FormField>

                {!isCRM && isPaymentStatus(actionForm.status) && (
                  <>
                    <FormField label={isRefundStatus(actionForm.status) ? 'Date of Refund' : 'Date of Receiving'} required>
                      <input type="date" name="lastDateOfReceiving" value={actionForm.lastDateOfReceiving} onChange={handleFormChange} disabled={isUpdating}
                        className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none text-sm border-slate-200 focus:border-blue-400" />
                    </FormField>
                    <FormField label={isRefundStatus(actionForm.status) ? 'Refund Amount' : 'Amount Received'} required>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input type="number" name="amountReceived" value={actionForm.amountReceived} onChange={handleFormChange} placeholder="0" min="0" disabled={isUpdating}
                          className="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg focus:outline-none text-sm border-slate-200 focus:border-blue-400" />
                      </div>
                    </FormField>
                    <FormField label="Bank Account" required>
                      <select name="bankName" value={actionForm.bankName} onChange={handleFormChange} disabled={isUpdating || banksLoading}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm">
                        <option value="">Select Bank Account</option>
                        {(bankMapping?.list || bankMapping?.data || []).map((item, idx) => {
                          const val = (item.bankAccount && item.bankAccount !== '—') ? item.bankAccount : item.project;
                          const label = (item.bankAccount && item.bankAccount !== '—') ? `${item.project} — ${item.bankAccount}` : item.project;
                          return <option key={idx} value={val}>{label}</option>;
                        })}
                      </select>
                    </FormField>
                    <FormField label="Payment Mode" required>
                      <select name="paymentMode" value={actionForm.paymentMode} onChange={handleFormChange} disabled={isUpdating}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm">
                        <option value="">Select Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="NEFT">NEFT</option>
                        <option value="RTGS">RTGS</option>
                        <option value="UPI">UPI</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormField>
                    <FormField label="Payment Details">
                      <input type="text" name="paymentDetails" value={actionForm.paymentDetails} onChange={handleFormChange} placeholder="Cheque No / UTR / Transaction ID etc." disabled={isUpdating}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm" />
                    </FormField>
                    <FormField label="GST %">
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        <select name="gstPercent" value={actionForm.gstPercent} onChange={handleFormChange} disabled={isUpdating}
                          className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm bg-white cursor-pointer appearance-none">
                          <option value="0">0% (No GST)</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                        </select>
                      </div>
                    </FormField>
                    {isWorkNotDoneStatus(actionForm.status) && (
                      <FormField label="TDS Amount">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                          <input type="number" name="tdsAmount" value={actionForm.tdsAmount} onChange={handleFormChange} placeholder="0" min="0" disabled={isUpdating}
                            className="w-full pl-8 pr-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none text-sm" />
                        </div>
                      </FormField>
                    )}
                    {(parseFloat(actionForm.gstPercent) > 0 || isWorkNotDoneStatus(actionForm.status)) && (parseFloat(actionForm.amountReceived) > 0) && (
                      <div className="md:col-span-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">GST Breakdown</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {isWorkNotDoneStatus(actionForm.status) && (
                            <div><p className="text-slate-400">Gross (Amount + TDS)</p><p className="font-bold text-slate-800">{formatCurrencyShort(gstCalculation.grossAmount)}</p></div>
                          )}
                          <div><p className="text-slate-400">Net Amount</p><p className="font-bold text-emerald-700">{formatCurrencyShort(gstCalculation.netAmount)}</p></div>
                          <div><p className="text-slate-400">CGST ({(parseFloat(actionForm.gstPercent) || 0) / 2}%)</p><p className="font-bold text-orange-600">{formatCurrencyShort(gstCalculation.cgst)}</p></div>
                          <div><p className="text-slate-400">SGST ({(parseFloat(actionForm.gstPercent) || 0) / 2}%)</p><p className="font-bold text-purple-600">{formatCurrencyShort(gstCalculation.sgst)}</p></div>
                          {isWorkNotDoneStatus(actionForm.status) && (
                            <div><p className="text-slate-400">TDS Amount</p><p className="font-bold text-yellow-700">{formatCurrencyShort(gstCalculation.tds)}</p></div>
                          )}
                        </div>
                      </div>
                    )}
                    <FormField label="Remark / Notes" className="md:col-span-2">
                      <textarea name="remark" value={actionForm.remark} onChange={handleFormChange} rows={3} disabled={isUpdating}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm resize-none" />
                    </FormField>
                  </>
                )}

                {(isCRM || actionForm.status === 'pending') && (
                  <>
                    <FormField label="Next Follow-up Date" required>
                      <input type="date" name="nextDate" value={actionForm.nextDate} onChange={handleFormChange} disabled={isUpdating}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm" />
                    </FormField>
                    <FormField label="Remark / Notes" required className="md:col-span-2">
                      <textarea name="remark" value={actionForm.remark} onChange={handleFormChange} rows={3} disabled={isUpdating}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm resize-none" />
                    </FormField>
                  </>
                )}
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t flex gap-3 justify-end rounded-b-2xl">
              <button onClick={closeActionModal} disabled={isUpdating}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition text-sm disabled:opacity-60">Cancel</button>
              <button onClick={handleSubmitAction} disabled={isUpdating || !actionForm.status}
                className="px-6 py-2.5 text-white font-bold rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700">
                {isUpdating ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : 'Submit Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePayment;