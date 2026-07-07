import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import employeeService from '../../services/employee.service';
import attendanceService from '../../services/attendance.service';
import dashboardService from '../../services/dashboard.service';
import leaveService from '../../services/leave.service';
import onDutyService from '../../services/onduty.service';
import DashboardCard from '../../components/DashboardCard';
import Loader from '../../components/Loader';
import { CalendarClock, UserCheck, UserX, Percent, Clock, LogIn, LogOut, MapPin, AlertCircle, CheckCircle2, Navigation2, FileText, Briefcase } from 'lucide-react';
import { formatPercentage } from '../../utils/helpers';
import '../../assets/styles/dashboard.css';

const OFFICE_LAT = 11.002373868782655;
const OFFICE_LON = 77.04344857733449;
const MAX_RADIUS_METERS = 100;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [leaves, setLeaves] = useState([]);
  const [onDutys, setOnDutys] = useState([]);

  // GPS States
  const [gpsData, setGpsData] = useState(null);
  const [isInsideOffice, setIsInsideOffice] = useState(false);
  const [distanceFromOffice, setDistanceFromOffice] = useState(null);
  const [locationError, setLocationError] = useState('Fetching GPS Location...');
  const [permissionState, setPermissionState] = useState('unknown');

  // Real-time clock for dashboard
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const watchIdRef = React.useRef(null);

  const startTracking = () => {
    setLocationError('Detecting your live location...');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        const dLat = lat - OFFICE_LAT;
        const dLon = lon - OFFICE_LON;
        const distance = calculateDistance(OFFICE_LAT, OFFICE_LON, lat, lon);
        
        console.log("=========================================");
        console.log("GPS VALIDATION DEBUG");
        console.log(`Current Latitude: ${lat}`);
        console.log(`Current Longitude: ${lon}`);
        console.log(`Office Latitude: ${OFFICE_LAT}`);
        console.log(`Office Longitude: ${OFFICE_LON}`);
        console.log(`Delta Latitude: ${dLat}`);
        console.log(`Delta Longitude: ${dLon}`);
        console.log(`Distance in meters: ${distance}`);
        console.log(`GPS Accuracy: ${accuracy}`);
        
        setGpsData({ 
          latitude: lat, 
          longitude: lon, 
          accuracy: accuracy,
          lastUpdated: new Date()
        });
        
        let currentStatus = 'Outside Office';
        if (accuracy > 150) {
          setIsInsideOffice(false);
          setLocationError(`Waiting for accurate GPS...`);
          currentStatus = 'Waiting for accurate GPS';
          setDistanceFromOffice(null);
        } else {
          setDistanceFromOffice(distance);
          if (distance <= MAX_RADIUS_METERS) {
            setIsInsideOffice(true);
            setLocationError('');
            currentStatus = 'Inside Office';
          } else {
            setIsInsideOffice(false);
            setLocationError('Attendance cannot be marked because you are outside the company premises.');
          }
        }
        
        console.log(`Permission State: granted`); // Simplified for debug since we're tracking
        console.log(`Attendance Status: ${currentStatus}`);
      },
      (err) => {
        let exactError = err.message || "Unknown error";
        if (err.code === 1) {
           exactError = 'Location permission required.';
        } else if (err.code === 2) {
          exactError = `Position Unavailable: ${err.message}`;
        } else if (err.code === 3) {
          exactError = `GPS Timeout: ${err.message}`;
        }
        setLocationError(exactError);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    localStorage.removeItem('cachedLocation');
    sessionStorage.removeItem('cachedLocation');

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
        };
      });
    }

    startTracking();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const profileRes = await employeeService.getMe();
      const fetchedProfile = profileRes.data;
      setProfile(fetchedProfile);
      
      const attendanceRes = await attendanceService.getByEmployee(fetchedProfile.id);
      const history = attendanceRes.data || [];
      // Sort history descending by date
      history.sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));
      setAttendanceHistory(history);

      const [leavesRes, onDutysRes] = await Promise.all([
        leaveService.getMyLeaves(),
        onDutyService.getMyOnDuty()
      ]);
      setLeaves(leavesRes.data || []);
      setOnDutys(onDutysRes.data || []);
    } catch (err) {
      setProfile(null);
      setAttendanceHistory([]);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchEmployeeData();
    }
  }, [user]);

  const handleCheckIn = async () => {
    if (!gpsData) {
      alert("Please wait for GPS to connect or click Retry Location.");
      return;
    }
    if (!isInsideOffice) {
      alert("Attendance cannot be marked because you are outside the company premises.");
      return;
    }
    
    try {
      await attendanceService.checkIn({
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        gpsAccuracy: gpsData.accuracy,
        deviceTime: new Date().toISOString()
      });
      alert('Checked in successfully!');
      fetchEmployeeData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!gpsData && !hasApprovedOnDutyToday) {
      alert("Please wait for GPS to connect or click Retry Location.");
      return;
    }

    
    try {
      await attendanceService.checkOut({
        latitude: gpsData?.latitude,
        longitude: gpsData?.longitude,
        gpsAccuracy: gpsData?.accuracy,
        deviceTime: new Date().toISOString()
      });
      alert('Checked out successfully!');
      fetchEmployeeData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to check out');
    }
  };

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let onDutyCount = 0;

  attendanceHistory.forEach(record => {
    if (record.status === 'PRESENT' || record.status === 'LATE') presentCount++;
    else if (record.status === 'ABSENT') absentCount++;
    else if (record.status === 'LEAVE') leaveCount++;
    else if (record.status === 'ON_DUTY') onDutyCount++;
  });

  const totalWorkingDays = presentCount + absentCount + leaveCount + onDutyCount;
  let attendancePercentage = 0;
  if (totalWorkingDays > 0) {
    attendancePercentage = (presentCount / totalWorkingDays) * 100;
  }

  // Determine today's attendance status
  const todayDateString = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceHistory.find(record => record.attendanceDate === todayDateString);
  
  const hasCheckedInToday = !!todayRecord;
  const hasCheckedOutToday = todayRecord && !!todayRecord.checkOutTime;

  let todayStatusText = "Not Checked In";
  if (hasCheckedOutToday) todayStatusText = "Checked Out";
  else if (hasCheckedInToday) todayStatusText = "Checked In";

  const hasApprovedOnDutyToday = onDutys.some(o => o.date === todayDateString && o.status === 'APPROVED');

  if (loading && !profile && !error) return <Loader />;

  return (
    <div className="dashboard-container page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Employee Dashboard</h2>
      </div>

      {error ? (
        <div className="error-message" style={{ background: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
          {error}
        </div>
      ) : profile ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* My Profile Section */}
            <div className="profile-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: '0', color: '#1e293b', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                My Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Name</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{profile.fullName || profile.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Employee ID</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{profile.employeeId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Email</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{profile.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Department</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{profile.Department?.departmentName || profile.department?.departmentName || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Designation</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{profile.designation || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Status</span>
                  <span className={`status-badge status-${(profile.status || '').toLowerCase()}`}>{profile.status || 'ACTIVE'}</span>
                </div>
              </div>
            </div>

            {/* Today's Attendance Section */}
            <div className="attendance-action-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginTop: '0', color: '#1e293b', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="#3b82f6" /> Today's Attendance
                </h3>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>
                    {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' }}>
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600', color: hasCheckedOutToday ? '#64748b' : hasCheckedInToday ? '#22c55e' : '#f59e0b' }}>
                    Status: {todayStatusText}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Location Status</span>
                    {locationError ? (
                       <div style={{ marginTop: '8px' }}>
                         <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={16}/> {locationError}</span>
                         {locationError.includes('Location permission required') && (
                           <button onClick={startTracking} className="btn btn-primary" style={{ marginTop: '10px', padding: '6px 12px', fontSize: '13px' }}>Retry Location</button>
                         )}
                       </div>
                    ) : gpsData === null ? (
                       <span style={{ color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Navigation2 size={16}/> Detecting your live location...</span>
                    ) : isInsideOffice ? (
                      <span style={{ color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>🟢 Inside Office</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>🔴 Outside Office</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     {!locationError && gpsData && distanceFromOffice !== null && (
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                          Distance: <strong>{Math.round(distanceFromOffice)}m</strong>
                        </div>
                     )}
                  </div>
                </div>
                {locationError && !locationError.includes('Location permission required') && !locationError.includes('Waiting for accurate GPS') && (
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#ef4444', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span>{locationError}</span>
                  </div>
                )}
                {!locationError && gpsData && !isInsideOffice && (
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>
                    Attendance cannot be marked because you are outside the company premises.
                  </div>
                )}
                {!locationError && gpsData && isInsideOffice && (
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#22c55e', textAlign: 'center' }}>
                    You are inside the company premises.<br/>Attendance can be marked.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button 
                  onClick={handleCheckIn}
                  disabled={hasCheckedInToday || !isInsideOffice}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: (hasCheckedInToday || !isInsideOffice) ? '#e2e8f0' : '#22c55e', 
                    color: (hasCheckedInToday || !isInsideOffice) ? '#94a3b8' : 'white', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    cursor: (hasCheckedInToday || !isInsideOffice) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}>
                  <LogIn size={20} /> Check In
                </button>
                <button 
                  onClick={handleCheckOut}
                  disabled={!hasCheckedInToday || hasCheckedOutToday}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: (!hasCheckedInToday || hasCheckedOutToday) ? '#e2e8f0' : '#ef4444', 
                    color: (!hasCheckedInToday || hasCheckedOutToday) ? '#94a3b8' : 'white', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    cursor: (!hasCheckedInToday || hasCheckedOutToday) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}>
                  <LogOut size={20} /> Check Out
                </button>
              </div>
            </div>
            
            {/* Office Timing Section */}
            <div className="timing-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: '0', color: '#1e293b', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#8b5cf6" /> Office Timing
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Shift</span>
                  <span style={{ color: '#0f172a', fontWeight: 'bold' }}>General Shift</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Timings</span>
                  <span style={{ color: '#0f172a', fontWeight: 'bold' }}>09:00 AM - 06:00 PM</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Grace Time</span>
                  <span style={{ color: '#0f172a', fontWeight: 'bold' }}>Up to 09:15 AM</span>
                </div>
              </div>
            </div>

            {/* Live GPS Status Section */}
            <div className="gps-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: '0', color: '#1e293b', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {gpsData && !locationError ? (
                  <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>🟢 GPS Connected</span>
                ) : (
                  <><MapPin size={20} color="#ef4444" /> Live GPS Status</>
                )}
                <button onClick={startTracking} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                  <Navigation2 size={14}/> Refresh
                </button>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Current Latitude</span>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{gpsData?.latitude?.toFixed(7) || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Current Longitude</span>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{gpsData?.longitude?.toFixed(7) || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Office Latitude</span>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{OFFICE_LAT.toFixed(7)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Office Longitude</span>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{OFFICE_LON.toFixed(7)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Distance From Office</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{distanceFromOffice ? `${Math.round(distanceFromOffice)} meters` : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>GPS Accuracy</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{gpsData?.accuracy ? `± ${Math.round(gpsData.accuracy)}m` : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>GPS Last Updated</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{gpsData?.lastUpdated ? gpsData.lastUpdated.toLocaleTimeString() : '-'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <DashboardCard title="Present" value={presentCount} icon={UserCheck} colorClass="card-green" />
            <DashboardCard title="Absent" value={absentCount} icon={UserX} colorClass="card-red" />
            <DashboardCard title="Leave" value={leaveCount} icon={CalendarClock} colorClass="card-yellow" />
            <DashboardCard title="Attendance %" value={formatPercentage(attendancePercentage)} icon={Percent} colorClass="card-teal" />
          </div>

          <div className="attendance-history-section" style={{ marginTop: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px', marginTop: '0', color: '#1e293b', fontSize: '20px', fontWeight: 'bold' }}>Attendance History</h3>
            {attendanceHistory.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '16px', fontWeight: '500' }}>No attendance history found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                      <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check In</th>
                      <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check Out</th>
                      <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Working Hours</th>
                      <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s ease' }}>
                        <td style={{ padding: '16px', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{new Date(record.attendanceDate).toLocaleDateString()}</td>
                        <td style={{ padding: '16px' }}>
                          <span className={`status-badge status-${(record.status || '').toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontSize: '15px' }}>
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontSize: '15px' }}>
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontSize: '15px', fontWeight: '600' }}>
                          {record.workingHours || '-'}
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontSize: '15px' }}>
                          {record.locationStatus === 'INSIDE' ? (
                            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14}/> Office</span>
                          ) : record.locationStatus === 'OUTSIDE' ? (
                            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> Outside</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default EmployeeDashboard;
