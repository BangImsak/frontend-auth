// src/pages/DataDownload.jsx (FINAL FINAL FINAL FINAL UPDATE: Download Filtered Data)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { database } from '../firebase'; 
import { ref, get, child } from 'firebase/database';
import { Download, List, Loader2, FileText, Search, Calendar } from 'lucide-react';

// ------------------- Headers สำหรับตารางย่อย -------------------
const DETAIL_TABLE_HEADERS = [
    { key: 'timestamp', label: 'Time' },
    { key: 'PM2_5', label: 'PM2.5' },
    { key: 'PM10', label: 'PM10' },
    { key: 'Pc0_1', label: 'Pc0.1 (Now)' },
    { key: 'Temperature', label: 'Temp (°C)' },
    { key: 'Humidity', label: 'Humidity (%)' },
    { key: 'Wind_speed', label: 'Wind (m/s)' },
    { key: 'Pc0_1_15min', label: '+15m' },
    { key: 'Pc0_1_30min', label: '+30m' },
    { key: 'Pc0_1_60min', label: '+60m' },
];

// --------------------------------------------------------
// คอมโพเนนต์ย่อย: DateRow (ไม่มีการเปลี่ยนแปลงใน Logic ดาวน์โหลดรายวัน)
// --------------------------------------------------------
const DateRow = ({ date, currentStatusData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const handleRowClick = () => {
        navigate(`/data-export/${date}`);
    };

    // ------------------- การสร้างและดาวน์โหลด CSV รายวัน -------------------
    const downloadCSV = async (e) => {
        e.stopPropagation();
        setLoading(true);
        
        try {
            const dataRef = child(ref(database), `env_logs/${date}`);
            const snapshot = await get(dataRef);

            if (snapshot.exists()) {
                const rawData = snapshot.val();
                const dataArray = Object.keys(rawData).map(key => rawData[key]);
                
                if (dataArray.length === 0) {
                    alert(`No records found for ${date}.`);
                    setLoading(false);
                    return;
                }

                // Header สำหรับ CSV
                const headers = DETAIL_TABLE_HEADERS.map(h => h.key); 
                const csvHeaders = headers.map(h => DETAIL_TABLE_HEADERS.find(d => d.key === h).label).join(','); // ใช้ Label เป็น Header

                // สร้างแถวข้อมูล
                const csvRows = dataArray.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        let processedValue = value === null || value === undefined ? '' : String(value);
                        if (processedValue.includes(',') || processedValue.includes('"') || processedValue.includes('\n')) {
                            processedValue = `"${processedValue.replace(/"/g, '""')}"`;
                        }
                        return processedValue;
                    }).join(',')
                );

                const csvContent = [csvHeaders, ...csvRows].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.setAttribute('href', url);
                link.setAttribute('download', `env_data_${date}.csv`);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                alert(`Downloaded env_data_${date}.csv successfully!`);
            } else {
                 alert(`No data found for ${date} to download.`);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to download data.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <tr 
            onClick={handleRowClick}
            className={`cursor-pointer transition-colors hover:bg-gray-50`}
        >
            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{date}</td>
            
            <td className="px-4 py-3 text-right">
                <button
                    onClick={downloadCSV}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5 ml-auto ${currentStatusData.bgClass}`}
                    style={{ backgroundColor: currentStatusData.bgClass.replace('bg-[', '').replace(']', '') }}
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {loading ? 'Preparing...' : 'Download CSV'}
                </button>
            </td>
        </tr>
    );
};

// --------------------------------------------------------
// คอมโพเนนต์หลัก: DataDownload
// --------------------------------------------------------
function DataDownload() {
    const [availableDates, setAvailableDates] = useState([]); 
    const [loadingDates, setLoadingDates] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState('');     
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false); 

    const currentStatusData = { bgImage: 'none', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500' };

    // ------------------- ดึงรายการวันที่ทั้งหมดที่มีข้อมูล -------------------
    useEffect(() => {
        const fetchAvailableDates = async () => {
            setLoadingDates(true);
            try {
                const logsRef = child(ref(database), `env_logs`);
                const snapshot = await get(logsRef);
                
                if (snapshot.exists()) {
                    let dates = Object.keys(snapshot.val());
                    dates.sort().reverse(); 
                    setAvailableDates(dates);
                } else {
                    setAvailableDates([]);
                }
            } catch (err) {
                console.error("Failed to fetch available dates:", err);
            } finally {
                setLoadingDates(false);
            }
        };
        fetchAvailableDates();
    }, []);

    // ------------------- Logic สำหรับ Search และ Filter วันที่ -------------------
    const filteredDates = availableDates.filter(date => {
        // 1. กรองด้วย Search Term (ชื่อวันที่)
        const matchesSearch = date.includes(searchTerm);
        
        // 2. กรองด้วย Date Range
        let matchesDateRange = true;
        
        if (startDate && date < startDate) {
            matchesDateRange = false;
        }

        if (endDate && date > endDate) {
            matchesDateRange = false;
        }

        return matchesSearch && matchesDateRange;
    });
    
    // ------------------- ฟังก์ชันปรับปรุง: ดาวน์โหลดข้อมูลเฉพาะที่ถูกกรอง -------------------
    const downloadFilteredDataCSV = async () => {
        setLoadingAll(true);
        let allCSVRows = [];
        const datesToDownload = filteredDates; // ใช้เฉพาะวันที่ที่ถูกกรองแล้ว

        if (datesToDownload.length === 0) {
            alert('No data records match the current filter criteria to download.');
            setLoadingAll(false);
            return;
        }

        try {
            const headers = [{ key: 'date', label: 'Date' }, ...DETAIL_TABLE_HEADERS]; 
            const csvHeaders = headers.map(h => h.label).join(',');

            // วนลูปผ่านวันที่ที่ถูกกรองเท่านั้น
            for (const date of datesToDownload) {
                const dataRef = child(ref(database), `env_logs/${date}`);
                const snapshot = await get(dataRef);

                if (snapshot.exists()) {
                    const dailyData = snapshot.val();
                    const dataArray = Object.keys(dailyData).map(key => dailyData[key]);
                    
                    const dailyCSVRows = dataArray.map(row => {
                        const rowData = [date]; // เพิ่มคอลัมน์ 'date'
                        
                        // เพิ่มข้อมูลคอลัมน์อื่นๆ
                        headers.slice(1).forEach(header => {
                            const value = row[header.key];
                            let processedValue = value === null || value === undefined ? '' : String(value);
                            if (processedValue.includes(',') || processedValue.includes('"') || processedValue.includes('\n')) {
                                processedValue = `"${processedValue.replace(/"/g, '""')}"`;
                            }
                            rowData.push(processedValue);
                        });
                        return rowData.join(',');
                    });
                    
                    allCSVRows = allCSVRows.concat(dailyCSVRows);
                }
            }


            if (allCSVRows.length === 0) {
                alert(`No detailed records found for the ${datesToDownload.length} selected days.`);
                setLoadingAll(false);
                return;
            }

            // รวม Header และข้อมูลทั้งหมด
            const csvContent = [csvHeaders, ...allCSVRows].join('\n');

            // Trigger การดาวน์โหลด
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            // ตั้งชื่อไฟล์ตามช่วงวันที่ที่ถูกกรอง
            const fileName = (startDate || endDate) 
                ? `env_data_filtered_${startDate || 'start'}_to_${endDate || 'end'}.csv`
                : `env_data_all_records.csv`;

            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert(`Downloaded ${fileName} containing data from ${datesToDownload.length} filtered days successfully!`);

        } catch (error) {
            console.error("Failed to download filtered data:", error);
            alert('Failed to download data due to an error.');
        } finally {
            setLoadingAll(false);
        }
    };


    // ------------------- UI Render -------------------
    return (
        <div className="flex min-h-screen relative overflow-hidden bg-gray-50">
            <Navbar onMenuClick={() => setSidebarOpen(true)} currentStatus={currentStatusData} />
            <Sidebar currentStatus={currentStatusData} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 ml-0 md:ml-[240px] pt-14 px-3 sm:px-4 md:px-6 pb-6 overflow-auto">
                <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><FileText size={28} className="text-emerald-500" /> Data Export History</h1>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 w-full"> 
                    
                    {/* ส่วน Search, Date Range Filter, และ Download All */}
                    <div className="flex flex-col gap-4 mb-6">
                        
                        {/* Title & Download Filtered Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <p className="text-lg font-semibold text-gray-700 flex-shrink-0">
                                Available Dates ({availableDates.length}) / Filtered ({filteredDates.length})
                            </p>
                            
                            {/* **ปุ่มดาวน์โหลดข้อมูลที่ถูกกรองแล้ว** */}
                            <button
                                onClick={downloadFilteredDataCSV}
                                disabled={loadingAll || filteredDates.length === 0}
                                className={`px-4 py-2 rounded-lg text-white font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 ${currentStatusData.bgClass}`}
                                style={{ backgroundColor: currentStatusData.bgClass.replace('bg-[', '').replace(']', '') }}
                            >
                                {loadingAll ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                {loadingAll ? 'Preparing Data...' : `Download ${filteredDates.length} Days CSV`}
                            </button>
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Search Date (YYYY-MM-DD)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {/* Date Range Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <div className="text-sm font-medium text-gray-600 flex items-center gap-2 flex-shrink-0">
                                <Calendar size={18} className="text-emerald-500" />
                                Filter Date Range:
                            </div>
                            
                            {/* Start Date Input */}
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition w-full sm:w-auto"
                                title="Start Date (YYYY-MM-DD)"
                            />

                            <span className="text-gray-500 font-semibold flex-shrink-0">to</span>

                            {/* End Date Input */}
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition w-full sm:w-auto"
                                title="End Date (YYYY-MM-DD)"
                            />
                        </div>
                    </div>

                    {/* ตารางแสดงรายการวันที่ */}
                    {loadingDates ? (
                        <p className="text-center text-emerald-600 font-medium my-8 flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin" /> Fetching date history...
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 text-gray-700">
                                    {filteredDates.length > 0 ? (
                                        filteredDates.map((d) => (
                                            <DateRow 
                                                key={d} 
                                                date={d} 
                                                currentStatusData={currentStatusData} 
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center text-gray-500 py-6 text-sm">
                                                {(searchTerm || startDate || endDate) ? 'No dates match the search or date range criteria.' : 'No data records found in Firebase.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DataDownload;