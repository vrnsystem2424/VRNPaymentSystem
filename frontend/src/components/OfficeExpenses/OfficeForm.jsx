
// 'use client';

// import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
// import { useGetAllFormDataQuery, useSubmitPaymentMutation } from '../../features/OfficeExpense/officeFormSlice';
// import { useGetProjectNamesQuery } from '../../features/OfficeExpense/officeFormSlice';

// // ─── Reusable Searchable Dropdown ─────────────────────────────────────────────
// function SearchableDropdown({ value, onChange, onSelect, options, placeholder, disabled, renderOption }) {
//   const [open, setOpen] = useState(false);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   return (
//     <div ref={containerRef} style={{ position: 'relative' }}>
//       <div style={{ position: 'relative' }}>
//         <input
//           type="text"
//           value={value}
//           onChange={(e) => { onChange(e.target.value); setOpen(true); }}
//           onFocus={e => { if (!disabled) { e.target.style.borderColor = '#6366f1'; setOpen(true); } }}
//           onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
//           disabled={disabled}
//           placeholder={placeholder}
//           style={{
//             width: '100%', padding: '10px 36px 10px 12px',
//             border: '1.5px solid #e2e8f0', borderRadius: '10px',
//             fontSize: '14px', background: disabled ? '#f8fafc' : '#fff',
//             color: disabled ? '#94a3b8' : '#1e293b',
//             outline: 'none', transition: 'border-color 0.2s',
//             boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
//           }}
//         />
//         <span style={{
//           position: 'absolute', right: '10px', top: '50%',
//           transform: 'translateY(-50%)', color: '#94a3b8',
//           pointerEvents: 'none', fontSize: '11px'
//         }}>▼</span>
//       </div>

//       {open && options.length > 0 && (
//         <div style={{
//           position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
//           background: '#fff', border: '1.5px solid #e0e7ff',
//           borderRadius: '10px', boxShadow: '0 8px 24px rgba(99,102,241,0.12)',
//           maxHeight: '220px', overflowY: 'auto', zIndex: 9999,
//         }}>
//           {options.map((opt, idx) => (
//             <div
//               key={idx}
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 onSelect(opt);
//                 setOpen(false);
//               }}
//               style={{
//                 padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
//                 color: '#1e293b',
//                 borderBottom: idx < options.length - 1 ? '1px solid #f1f5f9' : 'none',
//                 transition: 'background 0.12s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
//               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//             >
//               {renderOption ? renderOption(opt) : opt}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function Label({ children, required }) {
//   return (
//     <label style={{
//       display: 'block', fontSize: '13px', fontWeight: '600',
//       color: '#475569', marginBottom: '6px', letterSpacing: '0.01em'
//     }}>
//       {children}
//       {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
//     </label>
//   );
// }

// function Input({ value, onChange, placeholder, type = 'text', disabled, readOnly, required, min, step }) {
//   return (
//     <input
//       type={type} value={value} onChange={onChange} placeholder={placeholder}
//       disabled={disabled} readOnly={readOnly} required={required} min={min} step={step}
//       style={{
//         width: '100%', padding: '10px 12px',
//         border: '1.5px solid #e2e8f0', borderRadius: '10px',
//         fontSize: '14px', background: (disabled || readOnly) ? '#f8fafc' : '#fff',
//         color: (disabled || readOnly) ? '#94a3b8' : '#1e293b',
//         outline: 'none', transition: 'border-color 0.2s',
//         boxSizing: 'border-box', cursor: (disabled || readOnly) ? 'not-allowed' : 'text',
//       }}
//       onFocus={e => { if (!disabled && !readOnly) e.target.style.borderColor = '#6366f1'; }}
//       onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
//     />
//   );
// }

// const EMPTY_ITEM = () => ({
//   id: Date.now() + Math.random(),
//   subhead: '', subheadSearch: '',
//   itemName: '', itemNameSearch: '',
//   description: '',
//   unit: '', skuCode: '',
//   quantity: '', amount: ''
// });

// // ─── Main Component ────────────────────────────────────────────────────────────
// export default function OfficeForm() {

//   const [selectedOfficeName, setSelectedOfficeName] = useState('');
//   const [officeNameSearch, setOfficeNameSearch] = useState('');
//   const [payeeName, setPayeeName] = useState('');
//   const [selectedFormRaised, setSelectedFormRaised] = useState('');
//   const [formRaisedSearch, setFormRaisedSearch] = useState('');
//   const [billPhoto, setBillPhoto] = useState('');
//   const [billPhotoPreview, setBillPhotoPreview] = useState('');
//   const [fileInputKey, setFileInputKey] = useState(0);
//   const [remarks, setRemarks] = useState('');
//   const [items, setItems] = useState([EMPTY_ITEM()]);

//   const galleryInputRef = useRef(null);
//   const cameraInputRef = useRef(null);

//   const { data: allData, isLoading } = useGetAllFormDataQuery();
//   const [submitPayment, { isLoading: submitting }] = useSubmitPaymentMutation();

//   const {
//     data: projectNames = [],
//     isLoading: isProjectNamesLoading,
//   } = useGetProjectNamesQuery();

//   // ✅ FORM VALIDATION - Check all required fields
//   const missingFields = useMemo(() => {
//     const missing = [];

//     if (!selectedOfficeName) missing.push('Office Name');
//     if (!payeeName.trim()) missing.push('Payee Name');
//     if (!selectedFormRaised) missing.push('Form Raised By');
//     if (!billPhoto) missing.push('Bill Photo');

//     items.forEach((item, index) => {
//       const num = index + 1;
//       if (!item.subhead) missing.push(`Item #${num} Subhead`);
//       if (!item.itemName) missing.push(`Item #${num} Item Name`);
//       if (!item.description.trim()) missing.push(`Item #${num} Description`);
//       if (!item.quantity || parseFloat(item.quantity) <= 0) missing.push(`Item #${num} Quantity`);
//       if (!item.amount || parseFloat(item.amount) <= 0) missing.push(`Item #${num} Amount`);
//     });

//     return missing;
//   }, [selectedOfficeName, payeeName, selectedFormRaised, billPhoto, items]);

//   const isFormValid = missingFields.length === 0;

//   const filteredProjectNames = useMemo(() => {
//     if (!officeNameSearch) return projectNames;
//     return projectNames.filter(p =>
//       p.toLowerCase().includes(officeNameSearch.toLowerCase())
//     );
//   }, [officeNameSearch, projectNames]);

//   const allFormRaisedOptions = useMemo(() => {
//     if (!allData?.formRaised) return [];
//     const all = new Set();
//     Object.values(allData.formRaised).forEach(vals => vals.forEach(v => all.add(v)));
//     return Array.from(all);
//   }, [allData?.formRaised]);

//   const filteredFormRaised = useMemo(() => {
//     if (!formRaisedSearch) return allFormRaisedOptions;
//     return allFormRaisedOptions.filter(p =>
//       p.toLowerCase().includes(formRaisedSearch.toLowerCase())
//     );
//   }, [formRaisedSearch, allFormRaisedOptions]);

//   const subheadsList = allData?.subheads || [];

//   const getFilteredSubheads = (search) => {
//     if (!search) return subheadsList;
//     return subheadsList.filter(s => s.toLowerCase().includes(search.toLowerCase()));
//   };

//   const getFilteredItems = (subhead, search) => {
//     const list = (allData?.items?.[subhead]) || [];
//     if (!search) return list;
//     return list.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()));
//   };

//   const addItemAfter = (afterIndex) => {
//     setItems(prev => {
//       const newItems = [...prev];
//       newItems.splice(afterIndex + 1, 0, EMPTY_ITEM());
//       return newItems;
//     });
//   };

//   const removeItem = (id) => {
//     if (items.length === 1) return alert('At least one item is required');
//     setItems(prev => prev.filter(i => i.id !== id));
//   };

//   const updateItem = useCallback((id, fields) => {
//     setItems(prev => prev.map(item => item.id === id ? { ...item, ...fields } : item));
//   }, []);

//   const handleSubheadSelect = (id, subhead) => {
//     updateItem(id, {
//       subhead, subheadSearch: subhead,
//       itemName: '', itemNameSearch: '',
//       description: '',
//       unit: '', skuCode: ''
//     });
//   };

//   const handleItemSelect = (id, opt) => {
//     updateItem(id, {
//       itemName: opt.itemName, itemNameSearch: opt.itemName,
//       unit: opt.unit, skuCode: opt.skuCode
//     });
//   };

//   const handleBillPhoto = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setBillPhoto(reader.result);
//       setBillPhotoPreview(URL.createObjectURL(file));
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeBillPhoto = () => {
//     setBillPhoto('');
//     setBillPhotoPreview('');
//     setFileInputKey(prev => prev + 1);
//     if (galleryInputRef.current) galleryInputRef.current.value = '';
//     if (cameraInputRef.current) cameraInputRef.current.value = '';
//   };

//   const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

//   const resetForm = () => {
//     setSelectedOfficeName('');
//     setOfficeNameSearch('');
//     setPayeeName('');
//     setSelectedFormRaised('');
//     setFormRaisedSearch('');
//     setBillPhoto('');
//     setBillPhotoPreview('');
//     setFileInputKey(prev => prev + 1);
//     setRemarks('');
//     setItems([EMPTY_ITEM()]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!isFormValid) {
//       alert(`❌ Please fill all required fields:\n\n${missingFields.join('\n')}`);
//       return;
//     }

//     const payload = {
//       officeName: selectedOfficeName,
//       payeeName,
//       expensesHead: 'Office Expenses',
//       items: items.map(i => ({
//         subhead: i.subhead,
//         itemName: i.itemName,
//         description: i.description || '',
//         unit: i.unit,
//         skuCode: i.skuCode,
//         quantity: i.quantity,
//         amount: i.amount,
//         formRaisedBy: selectedFormRaised,
//         billPhoto: billPhoto || '',
//       })),
//       remarks: remarks || '',
//     };

//     try {
//       const result = await submitPayment(payload).unwrap();
//       alert(`✅ Success!\nBill No: ${result.data.billNumber}\nTotal: ₹${result.data.totalAmount}`);
//       resetForm();
//     } catch (err) {
//       alert('Submission failed: ' + (err.data?.error || err.message));
//     }
//   };

//   if (isLoading) {
//     return (
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', fontFamily: 'DM Sans, sans-serif' }}>
//         <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
//         <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Loading form data...</p>
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   // ✅ Calculate completion percentage
//   const totalRequired = 5 + (items.length * 5); // 5 global + 5 per item
//   const filledCount = totalRequired - missingFields.length;
//   const completionPercent = Math.round((filledCount / totalRequired) * 100);

//   return (
//     <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff 0%, #fafafa 55%, #ecfdf5 100%)', padding: '32px 16px', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
//         * { box-sizing: border-box; }
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>

//       <div style={{ maxWidth: '780px', margin: '0 auto', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 32px rgba(99,102,241,0.10)', overflow: 'visible' }}>

//         {/* ── Header ── */}
//         <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '20px 20px 0 0', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '14px' }}>
//           <div style={{ width: '46px', height: '46px', background: 'rgba(255,255,255,0.18)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🧾</div>
//           <div style={{ flex: 1 }}>
//             <h1 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }}>
//               Office Expenses Form
//             </h1>
//             <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.72)', fontSize: '13px' }}>
//               {selectedOfficeName || 'Select Project'} · Submit expense claims
//             </p>
//           </div>

//           {/* ✅ Completion Badge */}
//           <div style={{
//             background: completionPercent === 100 ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.15)',
//             borderRadius: '20px', padding: '6px 14px',
//             fontSize: '12px', fontWeight: '700',
//             color: completionPercent === 100 ? '#bbf7d0' : 'rgba(255,255,255,0.8)',
//             border: completionPercent === 100 ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.2)',
//           }}>
//             {completionPercent === 100 ? '✅' : '📝'} {completionPercent}%
//           </div>
//         </div>

//         {/* ✅ Progress Bar */}
//         <div style={{ height: '3px', background: '#e2e8f0' }}>
//           <div style={{
//             height: '100%',
//             width: `${completionPercent}%`,
//             background: completionPercent === 100
//               ? 'linear-gradient(90deg, #22c55e, #10b981)'
//               : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
//             transition: 'width 0.4s ease',
//             borderRadius: '0 2px 2px 0',
//           }} />
//         </div>

//         <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

//           {/* ── Section: Basic Info ── */}
//           <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <span>📋</span> Basic Information
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

//             {/* Office Name */}
//             <div>
//               <Label required>Office Name (Project)</Label>
//               <SearchableDropdown
//                 value={officeNameSearch}
//                 onChange={(val) => {
//                   setOfficeNameSearch(val);
//                   setSelectedOfficeName('');
//                 }}
//                 onSelect={(name) => {
//                   setSelectedOfficeName(name);
//                   setOfficeNameSearch(name);
//                 }}
//                 options={filteredProjectNames}
//                 placeholder={
//                   isProjectNamesLoading
//                     ? '⏳ Loading projects...'
//                     : 'Search project name...'
//                 }
//                 disabled={isProjectNamesLoading}
//               />
//               {selectedOfficeName && (
//                 <div style={{
//                   marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px',
//                   background: '#f0fdf4', border: '1px solid #86efac',
//                   borderRadius: '20px', padding: '4px 12px',
//                   fontSize: '12px', fontWeight: '600', color: '#15803d',
//                 }}>
//                   🏢 {selectedOfficeName}
//                   <span
//                     onClick={() => { setSelectedOfficeName(''); setOfficeNameSearch(''); }}
//                     style={{ cursor: 'pointer', color: '#16a34a', fontSize: '11px', fontWeight: '700' }}
//                   >✕</span>
//                 </div>
//               )}
//               {!isProjectNamesLoading && projectNames.length > 0 && (
//                 <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
//                   ✓ {projectNames.length} projects loaded
//                 </div>
//               )}
//             </div>

//             {/* Payee Name */}
//             <div>
//               <Label required>Payee Name</Label>
//               <Input
//                 value={payeeName}
//                 onChange={e => setPayeeName(e.target.value)}
//                 placeholder="Enter payee name"
//                 required
//               />
//               {/* ✅ Tick indicator */}
//               {payeeName.trim() && (
//                 <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
//                   ✓ Filled
//                 </div>
//               )}
//             </div>

//             {/* Form Raised By */}
//             <div style={{ gridColumn: '1 / -1' }}>
//               <Label required>Form Raised By</Label>
//               <SearchableDropdown
//                 value={formRaisedSearch}
//                 onChange={(val) => { setFormRaisedSearch(val); setSelectedFormRaised(''); }}
//                 onSelect={(person) => { setSelectedFormRaised(person); setFormRaisedSearch(person); }}
//                 options={filteredFormRaised}
//                 placeholder="Type to search or select person..."
//               />
//               {selectedFormRaised && (
//                 <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
//                   ✓ {selectedFormRaised}
//                 </div>
//               )}
//             </div>

//             {/* ✅ Bill Photo - Camera + Gallery */}
//             <div style={{ gridColumn: '1 / -1' }}>
//               <Label required>Bill Photo</Label>

//               {/* Hidden inputs */}
//               <input
//                 ref={galleryInputRef}
//                 key={`gallery-${fileInputKey}`}
//                 type="file"
//                 accept="image/*"
//                 onChange={handleBillPhoto}
//                 style={{ display: 'none' }}
//               />
//               <input
//                 ref={cameraInputRef}
//                 key={`camera-${fileInputKey}`}
//                 type="file"
//                 accept="image/*"
//                 capture="environment"
//                 onChange={handleBillPhoto}
//                 style={{ display: 'none' }}
//               />

//               {/* Buttons */}
//               {!billPhotoPreview && (
//                 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
//                   <button
//                     type="button"
//                     onClick={() => galleryInputRef.current?.click()}
//                     style={{
//                       flex: 1, minWidth: '140px',
//                       padding: '14px 16px',
//                       background: '#fafbff',
//                       border: '1.5px dashed #c7d2fe',
//                       borderRadius: '12px',
//                       cursor: 'pointer',
//                       display: 'flex', flexDirection: 'column',
//                       alignItems: 'center', justifyContent: 'center',
//                       gap: '6px', transition: 'all 0.2s',
//                     }}
//                     onMouseEnter={e => {
//                       e.currentTarget.style.background = '#f0f4ff';
//                       e.currentTarget.style.borderColor = '#818cf8';
//                     }}
//                     onMouseLeave={e => {
//                       e.currentTarget.style.background = '#fafbff';
//                       e.currentTarget.style.borderColor = '#c7d2fe';
//                     }}
//                   >
//                     <span style={{ fontSize: '24px' }}>🖼️</span>
//                     <span style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>Choose from Gallery</span>
//                     <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select existing photo</span>
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => cameraInputRef.current?.click()}
//                     style={{
//                       flex: 1, minWidth: '140px',
//                       padding: '14px 16px',
//                       background: '#fafbff',
//                       border: '1.5px dashed #a7f3d0',
//                       borderRadius: '12px',
//                       cursor: 'pointer',
//                       display: 'flex', flexDirection: 'column',
//                       alignItems: 'center', justifyContent: 'center',
//                       gap: '6px', transition: 'all 0.2s',
//                     }}
//                     onMouseEnter={e => {
//                       e.currentTarget.style.background = '#f0fdf4';
//                       e.currentTarget.style.borderColor = '#34d399';
//                     }}
//                     onMouseLeave={e => {
//                       e.currentTarget.style.background = '#fafbff';
//                       e.currentTarget.style.borderColor = '#a7f3d0';
//                     }}
//                   >
//                     <span style={{ fontSize: '24px' }}>📷</span>
//                     <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Take Photo</span>
//                     <span style={{ fontSize: '11px', color: '#94a3b8' }}>Open camera to capture</span>
//                   </button>
//                 </div>
//               )}

//               {/* Preview */}
//               {billPhotoPreview && (
//                 <div style={{
//                   marginTop: '8px', padding: '12px',
//                   background: '#f0fdf4', border: '1.5px solid #86efac',
//                   borderRadius: '12px',
//                   display: 'flex', alignItems: 'center', gap: '14px',
//                 }}>
//                   <img
//                     src={billPhotoPreview}
//                     alt="Bill"
//                     style={{
//                       height: '70px', width: '70px',
//                       objectFit: 'cover', borderRadius: '10px',
//                       border: '2px solid #e0e7ff',
//                     }}
//                   />
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontSize: '13px', fontWeight: '600', color: '#15803d', marginBottom: '4px' }}>
//                       ✅ Photo attached
//                     </div>
//                     <div style={{ fontSize: '11px', color: '#94a3b8' }}>
//                       Bill photo selected successfully
//                     </div>
//                   </div>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
//                     <button
//                       type="button"
//                       onClick={() => galleryInputRef.current?.click()}
//                       style={{
//                         background: '#eff6ff', color: '#3b82f6',
//                         border: '1px solid #bfdbfe', borderRadius: '8px',
//                         padding: '5px 10px', fontSize: '11px',
//                         fontWeight: '600', cursor: 'pointer',
//                       }}
//                     >
//                       🔄 Change
//                     </button>
//                     <button
//                       type="button"
//                       onClick={removeBillPhoto}
//                       style={{
//                         background: '#fff0f0', color: '#ef4444',
//                         border: '1px solid #fecaca', borderRadius: '8px',
//                         padding: '5px 10px', fontSize: '11px',
//                         fontWeight: '600', cursor: 'pointer',
//                       }}
//                     >
//                       ✕ Remove
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Global Remarks - NOT required */}
//             <div style={{ gridColumn: '1 / -1' }}>
//               <Label>Remarks (Optional)</Label>
//               <textarea
//                 value={remarks}
//                 onChange={e => setRemarks(e.target.value)}
//                 placeholder="Any general notes or remarks for this bill..."
//                 rows={2}
//                 style={{
//                   width: '100%', padding: '10px 12px',
//                   border: '1.5px solid #e2e8f0', borderRadius: '10px',
//                   fontSize: '14px', color: '#1e293b', resize: 'vertical',
//                   fontFamily: 'inherit', background: '#fff', outline: 'none',
//                   transition: 'border-color 0.2s',
//                 }}
//                 onFocus={e => e.target.style.borderColor = '#6366f1'}
//                 onBlur={e => e.target.style.borderColor = '#e2e8f0'}
//               />
//             </div>
//           </div>

//           {/* ── Divider ── */}
//           <div style={{ height: '1px', background: '#f1f5f9', margin: '28px 0' }} />

//           {/* ── Section: Items ── */}
//           <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <span>📦</span> Items Details
//           </div>

//           {items.map((item, index) => {
//             // ✅ Per-item completion check
//             const itemComplete =
//               item.subhead &&
//               item.itemName &&
//               item.description.trim() &&
//               item.quantity && parseFloat(item.quantity) > 0 &&
//               item.amount && parseFloat(item.amount) > 0;

//             return (
//               <div key={item.id}>
//                 <div style={{
//                   border: itemComplete ? '1.5px solid #86efac' : '1.5px solid #e0e7ff',
//                   borderRadius: '14px', padding: '20px',
//                   background: itemComplete ? '#f0fdf4' : '#fafbff',
//                   transition: 'all 0.3s',
//                 }}>

//                   {/* Item Header */}
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <span style={{
//                         background: itemComplete
//                           ? 'linear-gradient(135deg,#22c55e,#10b981)'
//                           : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
//                         color: '#fff', borderRadius: '8px',
//                         padding: '4px 12px', fontSize: '12px', fontWeight: '700',
//                       }}>
//                         {itemComplete ? '✅' : '📝'} Item #{index + 1}
//                       </span>

//                       {/* ✅ Item status */}
//                       {itemComplete && (
//                         <span style={{
//                           fontSize: '11px', color: '#10b981', fontWeight: '600',
//                         }}>
//                           Complete
//                         </span>
//                       )}
//                     </div>

//                     {items.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeItem(item.id)}
//                         style={{ background: '#fff0f0', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
//                         onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
//                         onMouseLeave={e => e.currentTarget.style.background = '#fff0f0'}
//                       >
//                         ✕ Remove
//                       </button>
//                     )}
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

//                     {/* Subhead */}
//                     <div>
//                       <Label required>Subhead</Label>
//                       <SearchableDropdown
//                         value={item.subheadSearch}
//                         onChange={(val) => updateItem(item.id, { subheadSearch: val, ...(val === '' ? { subhead: '' } : {}) })}
//                         onSelect={(subhead) => handleSubheadSelect(item.id, subhead)}
//                         options={getFilteredSubheads(item.subheadSearch)}
//                         placeholder="Search subhead..."
//                       />
//                       {item.subhead && (
//                         <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Selected</div>
//                       )}
//                     </div>

//                     {/* Item Name */}
//                     <div>
//                       <Label required>Item Name</Label>
//                       <SearchableDropdown
//                         value={item.itemNameSearch}
//                         onChange={(val) => {
//                           if (!item.subhead) { alert('Please select subhead first'); return; }
//                           updateItem(item.id, { itemNameSearch: val, ...(val === '' ? { itemName: '', unit: '', skuCode: '' } : {}) });
//                         }}
//                         onSelect={(opt) => handleItemSelect(item.id, opt)}
//                         options={getFilteredItems(item.subhead, item.itemNameSearch)}
//                         placeholder={item.subhead ? 'Search item...' : 'Select subhead first'}
//                         disabled={!item.subhead}
//                         renderOption={(opt) => (
//                           <div>
//                             <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{opt.itemName}</div>
//                             <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
//                               Unit: {opt.unit} · SKU: {opt.skuCode}
//                             </div>
//                           </div>
//                         )}
//                       />
//                       {item.itemName && (
//                         <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Selected</div>
//                       )}
//                     </div>

//                     {/* ✅ Description - Required */}
//                     <div style={{ gridColumn: '1 / -1' }}>
//                       <Label required>Description</Label>
//                       <textarea
//                         value={item.description}
//                         onChange={e => updateItem(item.id, { description: e.target.value })}
//                         placeholder="Enter item description (e.g., brand, size, specifications...)"
//                         rows={2}
//                         style={{
//                           width: '100%', padding: '10px 12px',
//                           border: `1.5px solid ${item.description.trim() ? '#86efac' : '#e2e8f0'}`,
//                           borderRadius: '10px',
//                           fontSize: '14px', color: '#1e293b', resize: 'vertical',
//                           fontFamily: 'inherit', background: '#fff', outline: 'none',
//                           transition: 'border-color 0.2s',
//                         }}
//                         onFocus={e => e.target.style.borderColor = '#6366f1'}
//                         onBlur={e => e.target.style.borderColor = item.description.trim() ? '#86efac' : '#e2e8f0'}
//                       />
//                       {item.description.trim() && (
//                         <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Filled</div>
//                       )}
//                     </div>

//                     {/* Unit */}
//                     <div>
//                       <Label>Unit</Label>
//                       <Input value={item.unit} readOnly placeholder="Auto-filled" />
//                     </div>

//                     {/* SKU Code */}
//                     <div>
//                       <Label>SKU Code</Label>
//                       <Input value={item.skuCode} readOnly placeholder="Auto-filled" />
//                     </div>

//                     {/* Quantity */}
//                     <div>
//                       <Label required>Quantity</Label>
//                       <Input
//                         type="number" value={item.quantity}
//                         onChange={e => updateItem(item.id, { quantity: e.target.value })}
//                         placeholder="0" min="0" step="1" required
//                       />
//                       {item.quantity && parseFloat(item.quantity) > 0 && (
//                         <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ {item.quantity} qty</div>
//                       )}
//                     </div>

//                     {/* Amount */}
//                     <div>
//                       <Label required>Amount (₹)</Label>
//                       <Input
//                         type="number" value={item.amount}
//                         onChange={e => updateItem(item.id, { amount: e.target.value })}
//                         placeholder="0.00" min="0" step="0.01" required
//                       />
//                       {item.amount && parseFloat(item.amount) > 0 && (
//                         <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
//                           ✓ ₹{parseFloat(item.amount).toLocaleString('en-IN')}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Add Item Below */}
//                 <div style={{ margin: '10px 0' }}>
//                   <button
//                     type="button"
//                     onClick={() => addItemAfter(index)}
//                     style={{
//                       width: '100%', padding: '9px',
//                       background: '#fff', color: '#6366f1',
//                       border: '1.5px dashed #a5b4fc', borderRadius: '10px',
//                       fontSize: '13px', fontWeight: '700', cursor: 'pointer',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
//                       transition: 'all 0.15s',
//                     }}
//                     onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.borderColor = '#6366f1'; }}
//                     onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#a5b4fc'; }}
//                   >
//                     + Add Item Below
//                   </button>
//                 </div>
//               </div>
//             );
//           })}

//           {/* ── Total ── */}
//           <div style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', border: '1.5px solid #e0e7ff', borderRadius: '12px', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '8px' }}>
//             <div>
//               <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Amount</div>
//               <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
//                 {items.length} item{items.length !== 1 ? 's' : ''}
//               </div>
//             </div>
//             <div style={{ fontSize: '30px', fontWeight: '800', color: '#6366f1', letterSpacing: '-0.02em' }}>
//               ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//             </div>
//           </div>

//           {/* ✅ Missing Fields Warning */}
//           {!isFormValid && (
//             <div style={{
//               background: '#fffbeb', border: '1.5px solid #fde68a',
//               borderRadius: '12px', padding: '12px 16px',
//               marginBottom: '16px',
//             }}>
//               <div style={{
//                 fontSize: '12px', fontWeight: '700', color: '#b45309',
//                 marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px',
//               }}>
//                 ⚠️ {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining
//               </div>
//               <div style={{
//                 fontSize: '11px', color: '#92400e',
//                 lineHeight: '1.6',
//               }}>
//                 {missingFields.slice(0, 5).map((field, i) => (
//                   <span key={i} style={{
//                     display: 'inline-block',
//                     background: '#fef3c7', borderRadius: '6px',
//                     padding: '2px 8px', margin: '2px 4px 2px 0',
//                     fontSize: '11px', fontWeight: '500',
//                   }}>
//                     {field}
//                   </span>
//                 ))}
//                 {missingFields.length > 5 && (
//                   <span style={{
//                     display: 'inline-block',
//                     background: '#fef3c7', borderRadius: '6px',
//                     padding: '2px 8px', margin: '2px 4px 2px 0',
//                     fontSize: '11px', fontWeight: '600', color: '#b45309',
//                   }}>
//                     +{missingFields.length - 5} more
//                   </span>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ✅ Submit Button - Disabled until form valid */}
//           <button
//             type="submit"
//             disabled={!isFormValid || submitting}
//             style={{
//               width: '100%',
//               background: (!isFormValid || submitting)
//                 ? '#e2e8f0'
//                 : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
//               color: (!isFormValid || submitting) ? '#94a3b8' : '#fff',
//               border: 'none', borderRadius: '12px',
//               padding: '14px', fontSize: '16px', fontWeight: '700',
//               cursor: (!isFormValid || submitting) ? 'not-allowed' : 'pointer',
//               boxShadow: (!isFormValid || submitting) ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
//               letterSpacing: '0.01em', transition: 'all 0.3s',
//             }}
//             onMouseEnter={e => { if (isFormValid && !submitting) e.currentTarget.style.opacity = '0.92'; }}
//             onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
//           >
//             {submitting
//               ? '⏳ Submitting...'
//               : !isFormValid
//                 ? `📝 Fill ${missingFields.length} required field${missingFields.length !== 1 ? 's' : ''} to submit`
//                 : `🚀 Submit ${items.length} Item${items.length !== 1 ? 's' : ''} · ₹${totalAmount.toLocaleString('en-IN')}`
//             }
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }







'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useGetAllFormDataQuery, useSubmitPaymentMutation } from '../../features/OfficeExpense/officeFormSlice';
import { useGetProjectNamesQuery } from '../../features/OfficeExpense/officeFormSlice';

// ─── Reusable Searchable Dropdown ─────────────────────────────────────────────
function SearchableDropdown({ value, onChange, onSelect, options, placeholder, disabled, renderOption }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={e => { if (!disabled) { e.target.style.borderColor = '#6366f1'; setOpen(true); } }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 36px 10px 12px',
            border: '1.5px solid #e2e8f0', borderRadius: '10px',
            fontSize: '14px', background: disabled ? '#f8fafc' : '#fff',
            color: disabled ? '#94a3b8' : '#1e293b',
            outline: 'none', transition: 'border-color 0.2s',
            boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        <span style={{
          position: 'absolute', right: '10px', top: '50%',
          transform: 'translateY(-50%)', color: '#94a3b8',
          pointerEvents: 'none', fontSize: '11px'
        }}>▼</span>
      </div>

      {open && options.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1.5px solid #e0e7ff',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(99,102,241,0.12)',
          maxHeight: '220px', overflowY: 'auto', zIndex: 9999,
        }}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setOpen(false);
              }}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
                color: '#1e293b',
                borderBottom: idx < options.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {renderOption ? renderOption(opt) : opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label style={{
      display: 'block', fontSize: '13px', fontWeight: '600',
      color: '#475569', marginBottom: '6px', letterSpacing: '0.01em'
    }}>
      {children}
      {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled, readOnly, required, min, step }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled} readOnly={readOnly} required={required} min={min} step={step}
      style={{
        width: '100%', padding: '10px 12px',
        border: '1.5px solid #e2e8f0', borderRadius: '10px',
        fontSize: '14px', background: (disabled || readOnly) ? '#f8fafc' : '#fff',
        color: (disabled || readOnly) ? '#94a3b8' : '#1e293b',
        outline: 'none', transition: 'border-color 0.2s',
        boxSizing: 'border-box', cursor: (disabled || readOnly) ? 'not-allowed' : 'text',
      }}
      onFocus={e => { if (!disabled && !readOnly) e.target.style.borderColor = '#6366f1'; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
    />
  );
}

const EMPTY_ITEM = () => ({
  id: Date.now() + Math.random(),
  subhead: '', subheadSearch: '',
  itemName: '', itemNameSearch: '',
  description: '',
  unit: '', skuCode: '',
  quantity: '', amount: ''
});

// ✅ IMAGE COMPRESSOR - Vercel 4.5MB limit se bachne ke liye
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 70% quality par compress
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OfficeForm() {

  const [selectedOfficeName, setSelectedOfficeName] = useState('');
  const [officeNameSearch, setOfficeNameSearch] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [selectedFormRaised, setSelectedFormRaised] = useState('');
  const [formRaisedSearch, setFormRaisedSearch] = useState('');
  const [billPhoto, setBillPhoto] = useState('');
  const [billPhotoPreview, setBillPhotoPreview] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState([EMPTY_ITEM()]);
  const [compressing, setCompressing] = useState(false);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const { data: allData, isLoading } = useGetAllFormDataQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitPaymentMutation();

  const {
    data: projectNames = [],
    isLoading: isProjectNamesLoading,
  } = useGetProjectNamesQuery();

  // ✅ FORM VALIDATION
  const missingFields = useMemo(() => {
    const missing = [];

    if (!selectedOfficeName) missing.push('Office Name');
    if (!payeeName.trim()) missing.push('Payee Name');
    if (!selectedFormRaised) missing.push('Form Raised By');
    if (!billPhoto) missing.push('Bill Photo');

    items.forEach((item, index) => {
      const num = index + 1;
      if (!item.subhead) missing.push(`Item #${num} Subhead`);
      if (!item.itemName) missing.push(`Item #${num} Item Name`);
      if (!item.description.trim()) missing.push(`Item #${num} Description`);
      if (!item.quantity || parseFloat(item.quantity) <= 0) missing.push(`Item #${num} Quantity`);
      if (!item.amount || parseFloat(item.amount) <= 0) missing.push(`Item #${num} Amount`);
    });

    return missing;
  }, [selectedOfficeName, payeeName, selectedFormRaised, billPhoto, items]);

  const isFormValid = missingFields.length === 0;

  const filteredProjectNames = useMemo(() => {
    if (!officeNameSearch) return projectNames;
    return projectNames.filter(p =>
      p.toLowerCase().includes(officeNameSearch.toLowerCase())
    );
  }, [officeNameSearch, projectNames]);

  const allFormRaisedOptions = useMemo(() => {
    if (!allData?.formRaised) return [];
    const all = new Set();
    Object.values(allData.formRaised).forEach(vals => vals.forEach(v => all.add(v)));
    return Array.from(all);
  }, [allData?.formRaised]);

  const filteredFormRaised = useMemo(() => {
    if (!formRaisedSearch) return allFormRaisedOptions;
    return allFormRaisedOptions.filter(p =>
      p.toLowerCase().includes(formRaisedSearch.toLowerCase())
    );
  }, [formRaisedSearch, allFormRaisedOptions]);

  const subheadsList = allData?.subheads || [];

  const getFilteredSubheads = (search) => {
    if (!search) return subheadsList;
    return subheadsList.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  };

  const getFilteredItems = (subhead, search) => {
    const list = (allData?.items?.[subhead]) || [];
    if (!search) return list;
    return list.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()));
  };

  const addItemAfter = (afterIndex) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(afterIndex + 1, 0, EMPTY_ITEM());
      return newItems;
    });
  };

  const removeItem = (id) => {
    if (items.length === 1) return alert('At least one item is required');
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = useCallback((id, fields) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...fields } : item));
  }, []);

  const handleSubheadSelect = (id, subhead) => {
    updateItem(id, {
      subhead, subheadSearch: subhead,
      itemName: '', itemNameSearch: '',
      description: '',
      unit: '', skuCode: ''
    });
  };

  const handleItemSelect = (id, opt) => {
    updateItem(id, {
      itemName: opt.itemName, itemNameSearch: opt.itemName,
      unit: opt.unit, skuCode: opt.skuCode
    });
  };

  // ✅ NEW handleBillPhoto - with Compression
  const handleBillPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressedBase64 = await compressImage(file);
      setBillPhoto(compressedBase64);
      setBillPhotoPreview(URL.createObjectURL(file));
      
      // Debug: File size check
      const sizeInKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
      console.log(`📸 Compressed image size: ${sizeInKB} KB`);
    } catch (err) {
      console.error("Image compression error:", err);
      alert('Image processing failed. Please try another image.');
    } finally {
      setCompressing(false);
    }
  };

  const removeBillPhoto = () => {
    setBillPhoto('');
    setBillPhotoPreview('');
    setFileInputKey(prev => prev + 1);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const resetForm = () => {
    setSelectedOfficeName('');
    setOfficeNameSearch('');
    setPayeeName('');
    setSelectedFormRaised('');
    setFormRaisedSearch('');
    setBillPhoto('');
    setBillPhotoPreview('');
    setFileInputKey(prev => prev + 1);
    setRemarks('');
    setItems([EMPTY_ITEM()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      alert(`❌ Please fill all required fields:\n\n${missingFields.join('\n')}`);
      return;
    }

    const payload = {
      officeName: selectedOfficeName,
      payeeName,
      expensesHead: 'Office Expenses',
      items: items.map(i => ({
        subhead: i.subhead,
        itemName: i.itemName,
        description: i.description || '',
        unit: i.unit,
        skuCode: i.skuCode,
        quantity: i.quantity,
        amount: i.amount,
        formRaisedBy: selectedFormRaised,
        billPhoto: billPhoto || '',
      })),
      remarks: remarks || '',
    };

    try {
      const result = await submitPayment(payload).unwrap();
      alert(`✅ Success!\nBill No: ${result.data.billNumber}\nTotal: ₹${result.data.totalAmount}`);
      resetForm();
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Submission failed: ' + (err.data?.error || err.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Loading form data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalRequired = 5 + (items.length * 5);
  const filledCount = totalRequired - missingFields.length;
  const completionPercent = Math.round((filledCount / totalRequired) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff 0%, #fafafa 55%, #ecfdf5 100%)', padding: '32px 16px', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '780px', margin: '0 auto', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 32px rgba(99,102,241,0.10)', overflow: 'visible' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '20px 20px 0 0', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', background: 'rgba(255,255,255,0.18)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🧾</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Office Expenses Form
            </h1>
            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.72)', fontSize: '13px' }}>
              {selectedOfficeName || 'Select Project'} · Submit expense claims
            </p>
          </div>

          <div style={{
            background: completionPercent === 100 ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.15)',
            borderRadius: '20px', padding: '6px 14px',
            fontSize: '12px', fontWeight: '700',
            color: completionPercent === 100 ? '#bbf7d0' : 'rgba(255,255,255,0.8)',
            border: completionPercent === 100 ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.2)',
          }}>
            {completionPercent === 100 ? '✅' : '📝'} {completionPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '3px', background: '#e2e8f0' }}>
          <div style={{
            height: '100%',
            width: `${completionPercent}%`,
            background: completionPercent === 100
              ? 'linear-gradient(90deg, #22c55e, #10b981)'
              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.4s ease',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📋</span> Basic Information
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Office Name */}
            <div>
              <Label required>Office Name (Project)</Label>
              <SearchableDropdown
                value={officeNameSearch}
                onChange={(val) => {
                  setOfficeNameSearch(val);
                  setSelectedOfficeName('');
                }}
                onSelect={(name) => {
                  setSelectedOfficeName(name);
                  setOfficeNameSearch(name);
                }}
                options={filteredProjectNames}
                placeholder={
                  isProjectNamesLoading
                    ? '⏳ Loading projects...'
                    : 'Search project name...'
                }
                disabled={isProjectNamesLoading}
              />
              {selectedOfficeName && (
                <div style={{
                  marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#f0fdf4', border: '1px solid #86efac',
                  borderRadius: '20px', padding: '4px 12px',
                  fontSize: '12px', fontWeight: '600', color: '#15803d',
                }}>
                  🏢 {selectedOfficeName}
                  <span
                    onClick={() => { setSelectedOfficeName(''); setOfficeNameSearch(''); }}
                    style={{ cursor: 'pointer', color: '#16a34a', fontSize: '11px', fontWeight: '700' }}
                  >✕</span>
                </div>
              )}
              {!isProjectNamesLoading && projectNames.length > 0 && (
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                  ✓ {projectNames.length} projects loaded
                </div>
              )}
            </div>

            {/* Payee Name */}
            <div>
              <Label required>Payee Name</Label>
              <Input
                value={payeeName}
                onChange={e => setPayeeName(e.target.value)}
                placeholder="Enter payee name"
                required
              />
              {payeeName.trim() && (
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                  ✓ Filled
                </div>
              )}
            </div>

            {/* Form Raised By */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label required>Form Raised By</Label>
              <SearchableDropdown
                value={formRaisedSearch}
                onChange={(val) => { setFormRaisedSearch(val); setSelectedFormRaised(''); }}
                onSelect={(person) => { setSelectedFormRaised(person); setFormRaisedSearch(person); }}
                options={filteredFormRaised}
                placeholder="Type to search or select person..."
              />
              {selectedFormRaised && (
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                  ✓ {selectedFormRaised}
                </div>
              )}
            </div>

            {/* Bill Photo */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label required>Bill Photo</Label>

              <input
                ref={galleryInputRef}
                key={`gallery-${fileInputKey}`}
                type="file"
                accept="image/*"
                onChange={handleBillPhoto}
                style={{ display: 'none' }}
              />
              <input
                ref={cameraInputRef}
                key={`camera-${fileInputKey}`}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleBillPhoto}
                style={{ display: 'none' }}
              />

              {!billPhotoPreview && !compressing && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      flex: 1, minWidth: '140px',
                      padding: '14px 16px',
                      background: '#fafbff',
                      border: '1.5px dashed #c7d2fe',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '6px', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f0f4ff';
                      e.currentTarget.style.borderColor = '#818cf8';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fafbff';
                      e.currentTarget.style.borderColor = '#c7d2fe';
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🖼️</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>Choose from Gallery</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select existing photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      flex: 1, minWidth: '140px',
                      padding: '14px 16px',
                      background: '#fafbff',
                      border: '1.5px dashed #a7f3d0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '6px', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#34d399';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fafbff';
                      e.currentTarget.style.borderColor = '#a7f3d0';
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📷</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Take Photo</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Open camera to capture</span>
                  </button>
                </div>
              )}

              {compressing && (
                <div style={{
                  padding: '20px', textAlign: 'center',
                  background: '#f0f4ff', border: '1.5px dashed #c7d2fe',
                  borderRadius: '12px',
                }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600' }}>
                    ⏳ Compressing image...
                  </div>
                </div>
              )}

              {billPhotoPreview && !compressing && (
                <div style={{
                  marginTop: '8px', padding: '12px',
                  background: '#f0fdf4', border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <img
                    src={billPhotoPreview}
                    alt="Bill"
                    style={{
                      height: '70px', width: '70px',
                      objectFit: 'cover', borderRadius: '10px',
                      border: '2px solid #e0e7ff',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#15803d', marginBottom: '4px' }}>
                      ✅ Photo attached & compressed
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Ready to upload
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      style={{
                        background: '#eff6ff', color: '#3b82f6',
                        border: '1px solid #bfdbfe', borderRadius: '8px',
                        padding: '5px 10px', fontSize: '11px',
                        fontWeight: '600', cursor: 'pointer',
                      }}
                    >
                      🔄 Change
                    </button>
                    <button
                      type="button"
                      onClick={removeBillPhoto}
                      style={{
                        background: '#fff0f0', color: '#ef4444',
                        border: '1px solid #fecaca', borderRadius: '8px',
                        padding: '5px 10px', fontSize: '11px',
                        fontWeight: '600', cursor: 'pointer',
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Remarks (Optional)</Label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Any general notes or remarks for this bill..."
                rows={2}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1.5px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', color: '#1e293b', resize: 'vertical',
                  fontFamily: 'inherit', background: '#fff', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9', margin: '28px 0' }} />

          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📦</span> Items Details
          </div>

          {items.map((item, index) => {
            const itemComplete =
              item.subhead &&
              item.itemName &&
              item.description.trim() &&
              item.quantity && parseFloat(item.quantity) > 0 &&
              item.amount && parseFloat(item.amount) > 0;

            return (
              <div key={item.id}>
                <div style={{
                  border: itemComplete ? '1.5px solid #86efac' : '1.5px solid #e0e7ff',
                  borderRadius: '14px', padding: '20px',
                  background: itemComplete ? '#f0fdf4' : '#fafbff',
                  transition: 'all 0.3s',
                }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: itemComplete
                          ? 'linear-gradient(135deg,#22c55e,#10b981)'
                          : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: '#fff', borderRadius: '8px',
                        padding: '4px 12px', fontSize: '12px', fontWeight: '700',
                      }}>
                        {itemComplete ? '✅' : '📝'} Item #{index + 1}
                      </span>

                      {itemComplete && (
                        <span style={{
                          fontSize: '11px', color: '#10b981', fontWeight: '600',
                        }}>
                          Complete
                        </span>
                      )}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{ background: '#fff0f0', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff0f0'}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                    <div>
                      <Label required>Subhead</Label>
                      <SearchableDropdown
                        value={item.subheadSearch}
                        onChange={(val) => updateItem(item.id, { subheadSearch: val, ...(val === '' ? { subhead: '' } : {}) })}
                        onSelect={(subhead) => handleSubheadSelect(item.id, subhead)}
                        options={getFilteredSubheads(item.subheadSearch)}
                        placeholder="Search subhead..."
                      />
                      {item.subhead && (
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Selected</div>
                      )}
                    </div>

                    <div>
                      <Label required>Item Name</Label>
                      <SearchableDropdown
                        value={item.itemNameSearch}
                        onChange={(val) => {
                          if (!item.subhead) { alert('Please select subhead first'); return; }
                          updateItem(item.id, { itemNameSearch: val, ...(val === '' ? { itemName: '', unit: '', skuCode: '' } : {}) });
                        }}
                        onSelect={(opt) => handleItemSelect(item.id, opt)}
                        options={getFilteredItems(item.subhead, item.itemNameSearch)}
                        placeholder={item.subhead ? 'Search item...' : 'Select subhead first'}
                        disabled={!item.subhead}
                        renderOption={(opt) => (
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{opt.itemName}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                              Unit: {opt.unit} · SKU: {opt.skuCode}
                            </div>
                          </div>
                        )}
                      />
                      {item.itemName && (
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Selected</div>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <Label required>Description</Label>
                      <textarea
                        value={item.description}
                        onChange={e => updateItem(item.id, { description: e.target.value })}
                        placeholder="Enter item description (e.g., brand, size, specifications...)"
                        rows={2}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: `1.5px solid ${item.description.trim() ? '#86efac' : '#e2e8f0'}`,
                          borderRadius: '10px',
                          fontSize: '14px', color: '#1e293b', resize: 'vertical',
                          fontFamily: 'inherit', background: '#fff', outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = item.description.trim() ? '#86efac' : '#e2e8f0'}
                      />
                      {item.description.trim() && (
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Filled</div>
                      )}
                    </div>

                    <div>
                      <Label>Unit</Label>
                      <Input value={item.unit} readOnly placeholder="Auto-filled" />
                    </div>

                    <div>
                      <Label>SKU Code</Label>
                      <Input value={item.skuCode} readOnly placeholder="Auto-filled" />
                    </div>

                    <div>
                      <Label required>Quantity</Label>
                      <Input
                        type="number" value={item.quantity}
                        onChange={e => updateItem(item.id, { quantity: e.target.value })}
                        placeholder="0" min="0" step="1" required
                      />
                      {item.quantity && parseFloat(item.quantity) > 0 && (
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ {item.quantity} qty</div>
                      )}
                    </div>

                    <div>
                      <Label required>Amount (₹)</Label>
                      <Input
                        type="number" value={item.amount}
                        onChange={e => updateItem(item.id, { amount: e.target.value })}
                        placeholder="0.00" min="0" step="0.01" required
                      />
                      {item.amount && parseFloat(item.amount) > 0 && (
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                          ✓ ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ margin: '10px 0' }}>
                  <button
                    type="button"
                    onClick={() => addItemAfter(index)}
                    style={{
                      width: '100%', padding: '9px',
                      background: '#fff', color: '#6366f1',
                      border: '1.5px dashed #a5b4fc', borderRadius: '10px',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.borderColor = '#6366f1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#a5b4fc'; }}
                  >
                    + Add Item Below
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', border: '1.5px solid #e0e7ff', borderRadius: '12px', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Amount</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#6366f1', letterSpacing: '-0.02em' }}>
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {!isFormValid && (
            <div style={{
              background: '#fffbeb', border: '1.5px solid #fde68a',
              borderRadius: '12px', padding: '12px 16px',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '12px', fontWeight: '700', color: '#b45309',
                marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                ⚠️ {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining
              </div>
              <div style={{
                fontSize: '11px', color: '#92400e',
                lineHeight: '1.6',
              }}>
                {missingFields.slice(0, 5).map((field, i) => (
                  <span key={i} style={{
                    display: 'inline-block',
                    background: '#fef3c7', borderRadius: '6px',
                    padding: '2px 8px', margin: '2px 4px 2px 0',
                    fontSize: '11px', fontWeight: '500',
                  }}>
                    {field}
                  </span>
                ))}
                {missingFields.length > 5 && (
                  <span style={{
                    display: 'inline-block',
                    background: '#fef3c7', borderRadius: '6px',
                    padding: '2px 8px', margin: '2px 4px 2px 0',
                    fontSize: '11px', fontWeight: '600', color: '#b45309',
                  }}>
                    +{missingFields.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || submitting || compressing}
            style={{
              width: '100%',
              background: (!isFormValid || submitting || compressing)
                ? '#e2e8f0'
                : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
              color: (!isFormValid || submitting || compressing) ? '#94a3b8' : '#fff',
              border: 'none', borderRadius: '12px',
              padding: '14px', fontSize: '16px', fontWeight: '700',
              cursor: (!isFormValid || submitting || compressing) ? 'not-allowed' : 'pointer',
              boxShadow: (!isFormValid || submitting || compressing) ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
              letterSpacing: '0.01em', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { if (isFormValid && !submitting && !compressing) e.currentTarget.style.opacity = '0.92'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {submitting
              ? '⏳ Submitting...'
              : compressing
                ? '📸 Processing image...'
                : !isFormValid
                  ? `📝 Fill ${missingFields.length} required field${missingFields.length !== 1 ? 's' : ''} to submit`
                  : `🚀 Submit ${items.length} Item${items.length !== 1 ? 's' : ''} · ₹${totalAmount.toLocaleString('en-IN')}`
            }
          </button>

        </form>
      </div>
    </div>
  );
}