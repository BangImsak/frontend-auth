import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { database } from '../firebase'; 
import { ref, query, limitToLast, onValue } from 'firebase/database';

// Import Assets
import bgGreen from '../assets/Untitled-1.jpg'; 
import bgGrey from '../assets/Untitled-2.jpg'; 
import bgYellow from '../assets/Untitled-3.jpg'; 
import bgRed from '../assets/Untitled-4.jpg'; 
import faceGreen from '../assets/เขียว.png'; 
import faceWhite from '../assets/ขาว.png'; 
import faceYellow from '../assets/เหลือง.png'; 
import faceRed from '../assets/แดง.png';

const AQI_RANGES = [
  { max: 1000, status: 'Comfortable', color: 'green', face: faceGreen, bgClass: 'bg-[#06b17a]', textClass: 'text-[#06b17a]', bgImage: bgGreen },
  { max: 10000, status: 'Neutral', color: 'blue', face: faceWhite, bgClass: 'bg-[#6b7280]', textClass: 'text-[#6b7280]', bgImage: bgGrey }, 
  { max: 50000, status: 'Uncomfortable', color: 'yellow', face: faceYellow, bgClass: 'bg-[#facc15]', textClass: 'text-[#facc15]', bgImage: bgYellow }, 
  { max: Infinity, status: 'Very Uncomfortable', color: 'red', face: faceRed, bgClass: 'bg-[#ef4444]', textClass: 'text-[#ef4444]', bgImage: bgRed }, 
];

function getAirQualityStatus(pc01) {
  for (const range of AQI_RANGES) { if (pc01 <= range.max) return range; }
  return AQI_RANGES[AQI_RANGES.length - 1];
}

function calculateForecast(history) {
    if (!history || history.length < 2) { const val = history[history.length - 1] || 0; return [val, val, val, val]; }
    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    history.forEach((y, x) => { sumX += x; sumY += y; sumXY += x * y; sumXX += x * x; });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const current = history[n - 1];
    const safeSlope = Math.max(-1000, Math.min(1000, slope)); 
    return [
        Math.max(0, Math.round(current + safeSlope * 5)),
        Math.max(0, Math.round(current + safeSlope * 10)),
        Math.max(0, Math.round(current + safeSlope * 15)),
        Math.max(0, Math.round(current + safeSlope * 20))
    ];
}

// In-App Toast
const AlertToast = ({ alert, onClose }) => { // 👈 รับ alert object เข้ามา
  if (!alert) return null;
  const { face, status, bgClass, textClass, value, time } = alert.statusData; // 👈 ดึงข้อมูลจาก statusData
  const borderColor = bgClass.replace('bg-', 'border-');
  return (
    <div className={`fixed top-20 right-4 z-[1000] w-80 md:w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border-l-8 ${borderColor} animate-[slideIn_0.5s_ease-out] ring-1 ring-black/5`}>
      <div className="p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="flex gap-4 items-start">
            <div className="w-16 h-16 flex-shrink-0 animate-bounce"><img src={face} alt={status} className="w-full h-full object-contain filter drop-shadow-md" /></div>
            <div className="flex-1 min-w-0">
                <h4 className={`text-lg font-extrabold uppercase leading-tight ${textClass} mb-1`}>Warning! ({time})</h4> {/* 👈 เพิ่มเวลาพยากรณ์ */}
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Potential Risk Detected</p>
                <p className={`text-sm font-bold mt-1 ${textClass}`}>{status.toUpperCase()}</p>
                <div className="mt-2 flex items-baseline gap-2"><span className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</span><span className="text-xs text-gray-400">pc/cm³</span></div>
            </div>
        </div>
        <button onClick={onClose} className={`mt-4 w-full py-2 rounded-lg text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all ${bgClass}`}>Acknowledge</button>
      </div>
    </div>
  );
};

// Main Cards
const MainCard = ({ pc01, temp, humidity, wind, statusData }) => {
    const { face, bgClass } = statusData;
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl py-3 px-3 sm:px-4 md:px-6 flex flex-col relative border-t-4 md:border-t-[6px] h-full transition-all duration-300 hover:shadow-2xl" style={{ borderTopColor: bgClass.replace('bg-[', '').replace(']', '') }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 mb-2 gap-2"><h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-700 uppercase tracking-wide">PC0.1 Concentration</h3><span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-600 whitespace-nowrap`}>Real-time 5 minute</span></div>
          <div className="flex flex-col lg:flex-row items-center justify-around gap-4 sm:gap-6 lg:gap-10 mt-2 sm:mt-4 z-10 flex-1 px-2 sm:px-4 lg:px-10">
              <div className="flex flex-col items-center justify-center"><div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-[220px] lg:h-[220px] 2xl:w-[260px] 2xl:h-[260px] leading-none flex items-center justify-center filter drop-shadow-lg transition-transform duration-500 hover:scale-105"><img src={face} alt="Status Icon" className="w-full h-full object-contain" /></div><p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-4xl font-bold mt-2 sm:mt-3 lg:mt-4 tracking-tight ${statusData.textClass}`}>{statusData.status}</p></div>
              <div className="flex flex-col items-center justify-center lg:pl-10 lg:border-l border-gray-200"><p className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] 2xl:text-[95px] font-black leading-none text-gray-800 tracking-tight drop-shadow-sm">{pc01.toLocaleString()}</p><p className="text-sm sm:text-base md:text-lg lg:text-2xl 2xl:text-3xl font-medium text-gray-500 mt-1 sm:mt-2 lg:mt-3">particles / cm³</p></div>
          </div>
          <div className={`flex flex-col sm:flex-row justify-around items-center border-t border-gray-100 mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 z-10 gap-3 sm:gap-0`}>
              <div className="flex items-center justify-center group px-2 sm:px-4 lg:px-6 w-full sm:w-auto"><span className="text-2xl sm:text-3xl lg:text-4xl mr-2 sm:mr-3 group-hover:text-red-500 transition-colors">🌡️</span><div className="flex flex-col items-center"><span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{temp}°C</span><span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Temperature</span></div></div>
              <div className="flex items-center justify-center group px-2 sm:px-4 lg:px-6 sm:border-l border-gray-100 w-full sm:w-auto"><span className="text-2xl sm:text-3xl lg:text-4xl mr-2 sm:mr-3 group-hover:text-blue-500 transition-colors">💧</span><div className="flex flex-col items-center"><span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{humidity}%</span><span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Humidity</span></div></div>
              <div className="flex items-center justify-center group px-2 sm:px-4 lg:px-6 sm:border-l border-gray-100 w-full sm:w-auto"><span className="text-2xl sm:text-3xl lg:text-4xl mr-2 sm:mr-3 group-hover:text-teal-500 transition-colors">💨</span><div className="flex flex-col items-center"><span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{wind} m/s</span><span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Wind Speed</span></div></div>
          </div>
      </div>
    );
};

const PMCard = ({ title, value, unit, statusData }) => (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg py-3 sm:py-4 px-3 sm:px-5 flex flex-col justify-between border-t-4 md:border-t-[6px] h-full transition-all duration-300 hover:shadow-xl" style={{ borderTopColor: statusData.bgClass.replace('bg-[', '').replace(']', '') }}>
        <div className="flex justify-between items-start"><h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-700 uppercase tracking-wide">{title}</h3></div>
        <div className="flex flex-col items-center flex-1 justify-center my-1 sm:my-2"><p className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight text-gray-800`}>{value}</p><p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-1 sm:mt-2">{unit}</p></div>
    </div>
);

const ForecastCard = ({ timeLabel, value, statusData }) => {
    const forecastStatus = getAirQualityStatus(value);
    return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-2 sm:p-3 md:p-4 flex flex-col items-center justify-center border-t-4 md:border-t-[6px] h-full transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl group" style={{ borderTopColor: forecastStatus.bgClass.replace('bg-[', '').replace(']', '') }}>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wider group-hover:text-gray-700 transition-colors">{timeLabel}</p>
            <div className="flex flex-col items-center justify-center w-full"><p className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none text-gray-800`}>{value.toLocaleString()}</p><p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 leading-tight mt-0.5 sm:mt-1 font-medium">pc/cm³</p></div>
        </div>
    );
}

// ✅ MAIN DASHBOARD
function Dashboard() {
  const [envData, setEnvData] = useState({ Pc0_1: 0, PM2_5: 0, PM10: 0, Temperature: 0, Humidity: 0, Wind_speed: 0 });
  const [forecastValues, setForecastValues] = useState([0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  
  // ✅ เปลี่ยน State สำหรับ Alerts เป็น Queue
  const [forecastAlerts, setForecastAlerts] = useState([]); 
  const [notiPermission, setNotiPermission] = useState(Notification.permission);
  const [currentUser, setCurrentUser] = useState(null);

  const currentStatusData = getAirQualityStatus(envData.Pc0_1);
  
  // เช็ค Login
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) { try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { console.error(e); } }
  }, []);

  const isLoggedIn = !!currentUser;

  // ขออนุญาต (เฉพาะ Logged in)
  const handleUserInteraction = () => {
    if (!isLoggedIn) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        setNotiPermission(permission);
        if (permission === 'granted') { new Notification("System Online", { body: "ระบบพร้อมแจ้งเตือนแล้ว", icon: faceGreen }); }
      });
    }
  };

  // Logic แจ้งเตือน (Browser Notification, Tab Blink, Sound)
  useEffect(() => {
    let blinkInterval;
    const currentAlert = forecastAlerts[0]; // ดึง Alert ตัวแรกในคิว
    
    if (currentAlert && isLoggedIn) {
      const { status, value, face, time } = currentAlert.statusData;
      
      // 1. เสียง
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`Warning! High air pollution detected for ${time}.`);
        msg.rate = 1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(msg);
      }
      // 2. Tab Blink
      let isWarning = true;
      blinkInterval = setInterval(() => { document.title = isWarning ? `⚠️⚠️ DANGER! (${time}) ⚠️⚠️` : "PM Dashboard"; isWarning = !isWarning; }, 1000);

      // 3. Browser Notification
      if (Notification.permission === 'granted') {
         new Notification(`⚠️ ${status}! (${time})`, {
             body: `Level: ${value.toLocaleString()} pc/cm³.`,
             icon: face,
             requireInteraction: true 
         });
      }
    } else {
      document.title = "PM Dashboard";
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    // ใช้ forecastAlerts เป็น dependency เพื่อให้ re-run เมื่อมี Alert ใหม่
    return () => { clearInterval(blinkInterval); document.title = "PM Dashboard"; };
  }, [forecastAlerts, isLoggedIn]); 
  
  // Firebase Data & Forecast Alert Logic
  useEffect(() => {
    const logsRef = ref(database, 'env_logs');
    const last10DaysQuery = query(logsRef, limitToLast(10));
    const unsubscribe = onValue(last10DaysQuery, (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
            const historyPC01 = [];
            let latestReading = null;
            snapshot.forEach((daySnapshot) => { daySnapshot.forEach((logEntry) => { const val = logEntry.val(); latestReading = val; if(val.Pc0_1 !== undefined) historyPC01.push(val.Pc0_1); }); });

            if (latestReading) {
                setEnvData({ Pc0_1: latestReading.Pc0_1 || 0, PM2_5: latestReading.PM2_5 || 0, PM10: latestReading.PM10 || 0, Temperature: latestReading.Temperature || 0, Humidity: latestReading.Humidity || 0, Wind_speed: latestReading.Wind_speed || 0 });
                const predictions = calculateForecast(historyPC01);
                setForecastValues(predictions);

                const predictionTimes = ['Current', '+15 min', '+30 min', '+45 min', '+60 min'];
                const allValues = [latestReading.Pc0_1 || 0, ...predictions];
                const newAlerts = [];
                const ALERT_THRESHOLD = 10000;

                allValues.forEach((val, index) => {
                    if (val > ALERT_THRESHOLD) {
                        const statusData = getAirQualityStatus(val);
                        newAlerts.push({
                            time: predictionTimes[index],
                            value: val,
                            statusData: { ...statusData, value: val, time: predictionTimes[index] }
                        });
                    }
                });

                // อัปเดต Alerts: หากมี Alert ใหม่ ให้แทนที่คิวเดิมเพื่อรับข้อมูลที่อัปเดต
                if (newAlerts.length > 0 && isLoggedIn) {
                    // หาก Alert ตัวแรกของคิวใหม่ เป็นอันเดียวกับ Alert ตัวแรกของคิวเก่า (เพื่อป้องกันการแจ้งเตือนซ้ำซ้อนใน Browser)
                    // เราจะทำการ setAlerts ใหม่ทันที เพื่อให้ In-App Toast อัปเดตข้อมูล
                    setForecastAlerts(newAlerts);
                } else if (newAlerts.length === 0) {
                    setForecastAlerts([]); // Clear alerts
                }
            }
        }
    });
    return () => unsubscribe();
  }, [isLoggedIn]);

  return (
    <div onClick={handleUserInteraction} className="flex min-h-screen relative overflow-hidden" style={{ backgroundImage: `url(${currentStatusData.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat' }}>
      <Navbar currentStatus={currentStatusData} /> 
      <Sidebar currentStatus={currentStatusData} />
      
      {/* ใช้งาน AlertToast กับ Alert ตัวแรกในคิว และเมื่อปิด (onClose) ให้ลบตัวแรกออกจากคิว */}
      <AlertToast 
        alert={forecastAlerts[0]} 
        onClose={() => setForecastAlerts(prev => prev.slice(1))} 
      />
      
      <div className="flex-1 ml-0 md:ml-[240px] pt-14 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 bg-black/5 min-h-screen flex flex-col overflow-auto backdrop-filter backdrop-grayscale-0"> 
        <div className="flex justify-end items-center py-2 sm:py-3 min-h-[40px] sm:min-h-[50px] gap-2"><span className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold bg-white/90 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-gray-700 shadow-sm border border-white/50 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md cursor-default"><span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span></span>Live Prediction Model</span></div>
        {loading ? ( <div className="flex-1 flex items-center justify-center"><div className="bg-white/80 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg flex items-center gap-2 sm:gap-3"><p className="text-sm sm:text-base md:text-lg font-medium text-gray-600">Connecting to sensors...</p></div></div> ) : ( 
             <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-h-0 pb-2"> 
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-[1.5] min-h-0">
                    <div className="lg:col-span-9 h-full min-h-[400px] sm:min-h-[450px] lg:min-h-0"><MainCard pc01={envData.Pc0_1} temp={envData.Temperature} humidity={envData.Humidity} wind={envData.Wind_speed} statusData={currentStatusData} /></div>
                    <div className="lg:col-span-3 flex flex-row lg:flex-col gap-3 sm:gap-4 h-auto lg:h-full"><div className="flex-1 min-h-[180px] sm:min-h-[200px] lg:min-h-0"><PMCard title="PM 2.5" value={envData.PM2_5} unit="µg/m³" statusData={currentStatusData} /></div><div className="flex-1 min-h-[180px] sm:min-h-[200px] lg:min-h-0"><PMCard title="PM 10" value={envData.PM10} unit="µg/m³" statusData={currentStatusData} /></div></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 h-[100px] sm:h-[120px] md:h-[140px] shrink-0"><ForecastCard timeLabel="+15 min" value={forecastValues[0]} statusData={currentStatusData} /><ForecastCard timeLabel="+30 min" value={forecastValues[1]} statusData={currentStatusData} /><ForecastCard timeLabel="+45 min" value={forecastValues[2]} statusData={currentStatusData} /><ForecastCard timeLabel="+60 min" value={forecastValues[3]} statusData={currentStatusData} /></div>
            </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;