import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { database } from '../firebase'; 
import { ref, query, limitToLast, onValue } from 'firebase/database';

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
  for (const range of AQI_RANGES) {
    if (pc01 <= range.max) {
      return range;
    }
  }
  return AQI_RANGES[AQI_RANGES.length - 1];
}

function calculateForecast(history) {
    if (!history || history.length < 2) {
        const val = history[history.length - 1] || 0;
        return [val, val, val, val];
    }

    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    history.forEach((y, x) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

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

const MainCard = ({ pc01, temp, humidity, wind, statusData }) => {
  const { face, bgClass } = statusData;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl py-3 px-3 sm:px-4 md:px-6 flex flex-col relative border-t-4 md:border-t-[6px] h-full transition-all duration-300 hover:shadow-2xl" 
         style={{ borderTopColor: bgClass.replace('bg-[', '').replace(']', '') }}>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 mb-2 gap-2">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-700 uppercase tracking-wide">PC0.1 Concentration</h3> 
            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-600 whitespace-nowrap`}>
                Real-time 5 minute
            </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-around gap-4 sm:gap-6 lg:gap-10 mt-2 sm:mt-4 z-10 flex-1 px-2 sm:px-4 lg:px-10">
            {/* Status Icon + Status Text */}
            <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-[220px] lg:h-[220px] 2xl:w-[260px] 2xl:h-[260px] 
                                leading-none flex items-center justify-center 
                                filter drop-shadow-lg transition-transform duration-500 hover:scale-105">
                    <img src={face} alt="Status Icon" className="w-full h-full object-contain" />
                </div>

                <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-4xl font-bold mt-2 sm:mt-3 lg:mt-4 tracking-tight ${statusData.textClass}`}>
                    {statusData.status}
                </p>
            </div>

            {/* PC0.1 VALUE */}
            <div className="flex flex-col items-center justify-center lg:pl-10 lg:border-l border-gray-200">
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] 2xl:text-[95px] font-black leading-none 
                               text-gray-800 tracking-tight drop-shadow-sm">
                    {pc01.toLocaleString()}
                </p>

                <p className="text-sm sm:text-base md:text-lg lg:text-2xl 2xl:text-3xl font-medium text-gray-500 mt-1 sm:mt-2 lg:mt-3">
                    particles / cm³
                </p>
            </div>
        </div>

        <div className={`flex flex-col sm:flex-row justify-around items-center border-t border-gray-100 mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 z-10 gap-3 sm:gap-0`}>
            
            {/* Temperature */}
            <div className="flex items-center justify-center group px-2 sm:px-4 lg:px-6 w-full sm:w-auto">
                <span className="text-2xl sm:text-3xl lg:text-4xl mr-2 sm:mr-3 group-hover:text-red-500 transition-colors">🌡️</span> 
                <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{temp}°C</span> 
                    <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Temperature</span>
                </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center justify-center group px-2 sm:px-4 lg:px-6 sm:border-l border-gray-100 w-full sm:w-auto">
                <span className="text-2xl sm:text-3xl lg:text-4xl mr-2 sm:mr-3 group-hover:text-blue-500 transition-colors">💧</span> 
                <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{humidity}%</span> 
                    <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Humidity</span>
                </div>
            </div>

            {/* Wind Speed */}
            <div className="flex items-center justify-center group px-2 sm:px-4 lg:px-6 sm:border-l border-gray-100 w-full sm:w-auto">
                <span className="text-2xl sm:text-3xl lg:text-4xl mr-2 sm:mr-3 group-hover:text-teal-500 transition-colors">💨</span> 
                <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{wind} m/s</span> 
                    <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Wind Speed</span>
                </div>
            </div>

        </div>
    </div>
  );
};

const PMCard = ({ title, value, unit, statusData }) => (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg py-3 sm:py-4 px-3 sm:px-5 flex flex-col justify-between border-t-4 md:border-t-[6px] h-full transition-all duration-300 hover:shadow-xl"
        style={{ borderTopColor: statusData.bgClass.replace('bg-[', '').replace(']', '') }}>
        <div className="flex justify-between items-start">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
        <div className="flex flex-col items-center flex-1 justify-center my-1 sm:my-2">
            <p className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight text-gray-800`}>{value}</p>
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-1 sm:mt-2">{unit}</p> 
        </div>
    </div>
);

const ForecastCard = ({ timeLabel, value, statusData }) => {
    const forecastStatus = getAirQualityStatus(value);

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-2 sm:p-3 md:p-4 flex flex-col items-center justify-center border-t-4 md:border-t-[6px] h-full transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl group"
             style={{ borderTopColor: forecastStatus.bgClass.replace('bg-[', '').replace(']', '') }}>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wider group-hover:text-gray-700 transition-colors">{timeLabel}</p>
            
            <div className="flex flex-col items-center justify-center w-full">
                <p className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none text-gray-800`}>{value.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 leading-tight mt-0.5 sm:mt-1 font-medium">pc/cm³</p>
            </div>
        </div>
    );
}

function Dashboard() {
  const [envData, setEnvData] = useState({
    Pc0_1: 0, 
    PM2_5: 0,
    PM10: 0,
    Temperature: 0,
    Humidity: 0,
    Wind_speed: 0,
  });
  
  const [forecastValues, setForecastValues] = useState([0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const statusData = getAirQualityStatus(envData.Pc0_1);
  
  useEffect(() => {
    const logsRef = ref(database, 'env_logs');
    const last10DaysQuery = query(logsRef, limitToLast(10));
    
    const unsubscribe = onValue(last10DaysQuery, (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
            const historyPC01 = [];
            let latestReading = null;

            snapshot.forEach((daySnapshot) => {
                daySnapshot.forEach((logEntry) => {
                    const val = logEntry.val();
                    latestReading = val;
                    if(val.Pc0_1 !== undefined) historyPC01.push(val.Pc0_1);
                });
            });

            if (latestReading) {
                setEnvData({
                    Pc0_1: latestReading.Pc0_1 || 0,
                    PM2_5: latestReading.PM2_5 || 0,
                    PM10: latestReading.PM10 || 0,
                    Temperature: latestReading.Temperature || 0,
                    Humidity: latestReading.Humidity || 0,
                    Wind_speed: latestReading.Wind_speed || 0,
                });

                const predictions = calculateForecast(historyPC01);
                setForecastValues(predictions);
            }
        }
    }, (error) => {
        console.error("Firebase read failed:", error);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    <div 
        className="flex min-h-screen relative overflow-hidden" 
        style={{
            backgroundImage: `url(${statusData.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            backgroundRepeat: 'no-repeat',
        }}
    >
      <Navbar currentStatus={statusData} /> 
      <Sidebar currentStatus={statusData} />
      
      {/* Main Content - ปรับ margin และ padding ตามขนาดหน้าจอ */}
      <div className="flex-1 ml-0 md:ml-[240px] pt-14 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 bg-black/5 min-h-screen flex flex-col overflow-auto backdrop-filter backdrop-grayscale-0"> 
        
        <div className="flex justify-end items-center py-2 sm:py-3 min-h-[40px] sm:min-h-[50px]">
            <span className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold bg-white/90 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-gray-700 shadow-sm border border-white/50 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md cursor-default">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span>
                </span>
                Live Prediction Model
            </span>
        </div>
        
        {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-white/80 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg flex items-center gap-2 sm:gap-3">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-gray-600">Connecting to sensors...</p>
                </div>
            </div>
        ) : (
             <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-h-0 pb-2"> 
                
                {/* Grid Layout - ปรับเป็น 1 column บน mobile, 12 columns บน desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-[1.5] min-h-0">
                    
                    {/* Left Section: Main Card (PC0.1) */}
                    <div className="lg:col-span-9 h-full min-h-[400px] sm:min-h-[450px] lg:min-h-0">
                        <MainCard 
                            pc01={envData.Pc0_1} 
                            temp={envData.Temperature} 
                            humidity={envData.Humidity} 
                            wind={envData.Wind_speed}
                            statusData={statusData}
                        />
                    </div>

                    {/* Right Section: PM2.5 & PM10 */}
                    <div className="lg:col-span-3 flex flex-row lg:flex-col gap-3 sm:gap-4 h-auto lg:h-full">
                        <div className="flex-1 min-h-[180px] sm:min-h-[200px] lg:min-h-0">
                            <PMCard 
                                title="PM 2.5" 
                                value={envData.PM2_5} 
                                unit="µg/m³" 
                                statusData={statusData}
                            />
                        </div>
                        <div className="flex-1 min-h-[180px] sm:min-h-[200px] lg:min-h-0">
                            <PMCard 
                                title="PM 10" 
                                value={envData.PM10} 
                                unit="µg/m³" 
                                statusData={statusData}
                            />
                        </div>
                    </div>
                </div>

                {/* Forecast Row - ปรับเป็น 2 columns บน mobile, 4 columns บน tablet/desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 h-[100px] sm:h-[120px] md:h-[140px] shrink-0">
                    <ForecastCard timeLabel="+15 min" value={forecastValues[0]} statusData={statusData} />
                    <ForecastCard timeLabel="+30 min" value={forecastValues[1]} statusData={statusData} />
                    <ForecastCard timeLabel="+45 min" value={forecastValues[2]} statusData={statusData} />
                    <ForecastCard timeLabel="+60 min" value={forecastValues[3]} statusData={statusData} />
                </div>

            </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;