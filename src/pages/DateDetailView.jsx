// src/pages/DateDetailView.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { database } from '../firebase'; 
import { ref, get, child } from 'firebase/database';
import { ArrowLeft, Loader2, Download } from 'lucide-react';

// ------------------- Headers สำหรับตารางย่อย (ข้อมูลสภาพแวดล้อม) -------------------
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

function DateDetailView() {
    // ดึงค่า :date จาก URL
    const { date } = useParams(); 
    const navigate = useNavigate();
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // กำหนดสีเริ่มต้น
    const currentStatusData = { bgImage: 'none', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500' };

    // ------------------- ดึงข้อมูลสำหรับวันที่เลือก -------------------
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setData([]);

            try {
                const dataRef = child(ref(database), `env_logs/${date}`);
                const snapshot = await get(dataRef);
                
                if (snapshot.exists()) {
                    const rawData = snapshot.val();
                    const dataArray = Object.keys(rawData).map(key => {
                        const item = rawData[key];
                        // เตรียมค่าแสดงเวลา
                        const displayTime = item.timestamp ? new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '-';
                        return { ...item, displayTime };
                    });
                    
                    if (dataArray.length === 0) {
                        setError(`No data records found for ${date}.`);
                    } else {
                        setData(dataArray);
                    }
                } else {
                    setError(`Date not found in database: ${date}`);
                }
            } catch (err) {
                console.error("Failed to fetch detail data:", err);
                setError('Failed to connect to the database.');
            } finally {
                setLoading(false);
            }
        };

        if (date) {
            fetchData();
        } else {
            navigate('/data-export'); // ถ้าไม่มีวันที่ใน URL ให้กลับไปหน้าหลัก
        }
    }, [date, navigate]);


    // ------------------- การสร้างและดาวน์โหลด CSV -------------------
    const downloadCSV = () => {
        if (data.length === 0) {
            alert('No data to download.');
            return;
        }

        const headers = DETAIL_TABLE_HEADERS.map(h => h.key); 
        const csvHeaders = headers.join(',');

        const csvRows = data.map(row => 
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
    };


    // ------------------- UI Render -------------------
    return (
        <div className="flex min-h-screen relative overflow-hidden bg-gray-50">
            <Navbar onMenuClick={() => setSidebarOpen(true)} currentStatus={currentStatusData} />
            <Sidebar currentStatus={currentStatusData} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* เนื้อหาหลักแบบเต็มจอ */}
            <div className="flex-1 ml-0 md:ml-[240px] pt-14 px-3 sm:px-4 md:px-6 pb-6 overflow-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-200 mb-6 gap-3">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)} // ปุ่มย้อนกลับ
                            className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                            title="Go back to data list"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Data Details for <span className="text-emerald-600">{date}</span>
                        </h1>
                    </div>
                    
                    {data.length > 0 && (
                        <button
                            onClick={downloadCSV}
                            disabled={loading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2 ${currentStatusData.bgClass}`}
                            style={{ backgroundColor: currentStatusData.bgClass.replace('bg-[', '').replace(']', '') }}
                        >
                            <Download size={18} /> Download All CSV
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 w-full"> 
                    
                    {loading && (
                        <p className="text-center text-emerald-600 font-medium my-8 flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin" /> Loading data records...
                        </p>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg my-8">
                            <p className="font-semibold">Error:</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    
                    {!loading && data.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {DETAIL_TABLE_HEADERS.map((header) => (
                                            <th key={header.key} className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                {header.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {data.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-1 text-xs font-medium text-gray-800 whitespace-nowrap">{row.displayTime}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.PM2_5 !== undefined ? row.PM2_5 : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.PM10 !== undefined ? row.PM10 : '-'}</td>
                                            <td className="px-3 py-1 text-xs font-semibold whitespace-nowrap">{row.Pc0_1 !== undefined ? row.Pc0_1 : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.Temperature !== undefined ? row.Temperature : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.Humidity !== undefined ? row.Humidity : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.Wind_speed !== undefined ? row.Wind_speed : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.Pc0_1_15min !== undefined ? row.Pc0_1_15min : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.Pc0_1_30min !== undefined ? row.Pc0_1_30min : '-'}</td>
                                            <td className="px-3 py-1 text-xs whitespace-nowrap">{row.Pc0_1_60min !== undefined ? row.Pc0_1_60min : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {!loading && data.length === 0 && !error && (
                        <p className="text-center text-gray-500 font-medium my-8">No records found for this date.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DateDetailView;