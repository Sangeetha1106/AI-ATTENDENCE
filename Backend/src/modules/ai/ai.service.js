const genAI = require('../../config/gemini');
const dashboardService = require('../dashboard/dashboard.service');
const Employee = require('../employee/employee.model');
const Department = require('../department/department.model');
const Attendance = require('../attendance/attendance.model');
const { Op } = require('sequelize');

const getOrganizationSummary = async (user) => {
  try {
    const todayStats = await dashboardService.getToday(user);

    let employeeWhere = { status: 'ACTIVE' };
    let attendanceWhere = {};
    if (user.role === 'DEPARTMENT_MANAGER') {
      const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
      if (managerDept) {
        employeeWhere.departmentId = managerDept.id;
        attendanceWhere.departmentId = managerDept.id;
      } else {
        employeeWhere.departmentId = -1;
        attendanceWhere.departmentId = -1;
      }
    } else if (user.role === 'EMPLOYEE') {
      employeeWhere.id = user.id;
      attendanceWhere.employeeId = user.id;
    }

    const employees = await Employee.findAll({
      where: employeeWhere,
      include: [{
        model: Attendance,
        as: 'attendances',
        where: attendanceWhere,
        required: false
      }, {
        model: Department,
        as: 'department'
      }]
    });

    const deptStatsMap = {};
    const empStats = [];

    employees.forEach(emp => {
      let p = 0, a = 0, o = 0, l = 0;
      emp.attendances.forEach(att => {
        if(att.status === 'PRESENT') p++;
        if(att.status === 'ABSENT') a++;
        if(att.status === 'ON_DUTY') o++;
        if(att.status === 'LEAVE') l++;
      });
      
      empStats.push({ name: emp.fullName, p, a, o, l });

      const deptName = emp.department ? emp.department.departmentName : 'Unassigned';
      if (!deptStatsMap[deptName]) deptStatsMap[deptName] = { p: 0, a: 0, o: 0, l: 0 };
      deptStatsMap[deptName].p += p;
      deptStatsMap[deptName].a += a;
      deptStatsMap[deptName].o += o;
      deptStatsMap[deptName].l += l;
    });

    const departmentWiseData = Object.keys(deptStatsMap).map(k => 
      `${k}: Present=${deptStatsMap[k].p}, Absent=${deptStatsMap[k].a}, OnDuty=${deptStatsMap[k].o}, Leave=${deptStatsMap[k].l}`
    ).join('\n');

    const employeeWiseData = empStats.map(e => 
      `${e.name}: Present=${e.p}, Absent=${e.a}, Leave=${e.l}`
    ).join('\n');

    const topEmployees = [...empStats].sort((a,b) => b.p - a.p).slice(0, 5)
      .map(e => `${e.name} (Present: ${e.p} days)`).join('\n');

    const longAbsentEmployees = [...empStats].sort((a,b) => b.a - a.a).slice(0, 5)
      .filter(e => e.a > 0).map(e => `${e.name} (Absent: ${e.a} days)`).join('\n');

    let responseText = '';
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key' || process.env.GEMINI_API_KEY === '') {
      const score = todayStats.attendancePercentage > 85 ? 95 : (todayStats.attendancePercentage > 60 ? 75 : 55);
      const status = todayStats.attendancePercentage > 85 ? 'Good' : (todayStats.attendancePercentage > 60 ? 'Average' : 'Poor');
      
      responseText = `
# 🏢 Executive HR Attendance Analytics Report
**Scope:** Organization-Wide

---

### 1. 📊 Today's Attendance Summary
- **Total Employees:** ${todayStats.totalEmployees}
- **Present:** ${todayStats.totalPresent}
- **Absent:** ${todayStats.totalAbsent}
- **On Duty:** ${todayStats.totalOnDuty}
- **Leave:** ${todayStats.totalLeave}
- **Attendance Percentage:** ${todayStats.attendancePercentage}%
- **Overall Status:** **${status}**

---

### 2. 📈 Trend Analysis
- **Daily Insight:** The current presence rate is ${todayStats.attendancePercentage}%.
- **Weekly Trend:** Consistency across departments is varying.
- **Monthly Performance:** Tracking closely with the quarterly average.

---

### 3. 🏢 Department Performance
- **Department-wise Statistics:**
${departmentWiseData.split('\n').map(d => '  - *' + d + '*').join('\n')}

---

### 4. 👨‍💼 Employee Insights
- **Top Performing Employees:** 
${topEmployees.split('\n').map(d => '  - ' + d).join('\n')}
- **Long Absent Employees:** 
${longAbsentEmployees ? longAbsentEmployees.split('\n').map(d => '  - ' + d).join('\n') : '  - None detected'}

---

### 5. ⚠️ Risk Prediction
- **Employees likely to have attendance issues:** Employees appearing on the long absent list require immediate monitoring.
- **Departments at risk:** Departments with high absent ratios need HR intervention.

---

### 6. 🏆 Best Employee Recognition
- **Appreciation Message:** *"Thank you to our top employees for your outstanding dedication and flawless attendance this month!"*

---

### 7. 📉 Problem Detection
- **Attendance issues:** Unplanned absences affect operational throughput.
- **Patterns of absenteeism:** Need to track days correlating with holidays.

---

### 8. 💡 Recommendations
- **HR improvement suggestions:** Conduct immediate check-ins with frequently absent staff.
- **Attendance policy suggestions:** Enforce strict advance notice policies for non-medical leave.
- **Employee engagement strategies:** Gamify attendance by offering quarterly bonuses.

---

### 9. 📊 Overall Organization Score
**Score:** **${score} / 100**

---

### 10. 🧠 Final Conclusion
The organization's attendance health is currently ${status.toLowerCase()}. Unplanned absences are the primary bottleneck affecting workforce predictability. Immediate HR interventions and targeted employee engagement strategies are recommended.
`;
    } else {
      const prompt = `[PROMPT SKIPPED FOR MOCK]`; // In production, add actual prompt
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
    }
    
    return { summary: responseText };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw new Error('Failed to generate AI summary from Gemini');
  }
};

const _generateEmployeeStatsAndSummary = async (employee) => {
  let p = 0, a = 0, l = 0, late = 0, o = 0, halfDays = 0;
  let totalMinutes = 0, daysWithHours = 0;
  
  // For monthly analytics trends
  let currentMonthPresent = 0;
  let currentMonthAbsent = 0;
  let currentMonthLate = 0;
  let currentMonthLeave = 0;
  let currentMonthOnDuty = 0;

  let todayStatus = 'Absent';

  const attendances = employee.attendances || [];
  
  const todayObj = new Date();
  const todayDate = todayObj.toISOString().split('T')[0];
  const currentMonthStr = todayDate.substring(0, 7); // YYYY-MM

  attendances.forEach(att => {
    let statusMark = 'Absent';
    const isCurrentMonth = att.attendanceDate.startsWith(currentMonthStr);

    if (att.status === 'PRESENT') {
      p++;
      if (isCurrentMonth) currentMonthPresent++;
      statusMark = 'Present';
      if (att.clockInTime && att.clockInTime > '09:15:00') {
        late++;
        if (isCurrentMonth) currentMonthLate++;
      }
    } else if (att.status === 'ON_DUTY') {
      o++;
      if (isCurrentMonth) currentMonthOnDuty++;
      statusMark = 'On Duty';
    } else if (att.status === 'LEAVE') {
      l++;
      if (isCurrentMonth) currentMonthLeave++;
      statusMark = 'Leave';
    } else {
      a++;
      if (isCurrentMonth) currentMonthAbsent++;
    }
    
    if (att.attendanceDate === todayDate) {
      todayStatus = statusMark;
    }

    // Process working hours
    if (att.workingHours) {
      const parts = att.workingHours.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const mins = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(mins)) {
          const totalMins = hours * 60 + mins;
          totalMinutes += totalMins;
          daysWithHours++;

          if (totalMins > 0 && totalMins < 5 * 60) {
            halfDays++;
          }
        }
      }
    }
  });

  const totalDays = p + a + l + o;
  const attendancePercentage = totalDays > 0 ? Math.round(((p + o) / totalDays) * 100) : 0;

  const avgMinutes = daysWithHours > 0 ? Math.round(totalMinutes / daysWithHours) : 0;

  const formatTime = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  const totalWorkingHoursStr = formatTime(totalMinutes);
  const avgWorkingHoursStr = formatTime(avgMinutes);

  const stats = {
    present: p,
    absent: a,
    late: late,
    leave: l,
    onDuty: o,
    halfDay: halfDays,
    totalWorkingDays: totalDays,
    attendancePercentage: attendancePercentage,
    todayStatus: todayStatus,
    totalWorkingHours: totalWorkingHoursStr,
    avgWorkingHours: avgWorkingHoursStr,
    // Monthly analytics
    currentMonthPresent,
    currentMonthAbsent,
    currentMonthLate,
    currentMonthLeave,
    currentMonthOnDuty
  };

  let aiSummary = '';
  
  if (totalDays === 0) {
    aiSummary = "No attendance records found.";
  } else {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key' || process.env.GEMINI_API_KEY === '') {
      if (attendancePercentage > 90) {
        aiSummary = `**Performance:**\nAttendance is excellent.\nRarely absent.\nUsually arrives before office time.\nHighly punctual.\n\n**Recommendation:**\nKeep maintaining attendance.`;
      } else if (attendancePercentage > 75) {
        aiSummary = `**Performance:**\nGood attendance.\nOccasionally absent.\nGenerally reliable.\n\n**Recommendation:**\nContinue good work but minimize unplanned leaves.`;
      } else {
        aiSummary = `**Performance:**\nAttendance below company expectation.\nFrequent absences detected.\nMultiple late arrivals.\n\n**Recommendation:**\nManager should discuss attendance.`;
      }
    } else {
      const prompt = `
You are an AI Attendance Summary System.
Evaluate this employee's attendance:
Name: ${employee.fullName}
Present: ${p} days
Absent: ${a} days
Late: ${late} days
Leave: ${l} days
Attendance: ${attendancePercentage}%
Average Working Hours: ${avgWorkingHoursStr}

Keep it professional. Output 3 bullet points for Performance and 1 direct Recommendation based on this data.
`;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiSummary = response.text();
      } catch (err) {
        aiSummary = `Failed to generate AI content.`;
      }
    }
  }

  // Determine Reporting Manager Placeholder if not explicitly available
  const reportingManager = employee.department && employee.department.managerName 
    ? employee.department.managerName 
    : 'HR Dept / Direct';

  const employeeData = {
    id: employee.id,
    fullName: employee.fullName,
    employeeId: employee.employeeId,
    email: employee.email,
    departmentName: employee.department ? employee.department.departmentName : 'N/A',
    designation: employee.designation || 'N/A',
    reportingManager,
    employmentStatus: employee.status || 'ACTIVE'
  };

  return {
    employee: employeeData,
    stats,
    aiSummary
  };
};

const searchEmployeeSummary = async (user, searchName) => {
  try {
    const whereClause = {
      fullName: {
        [Op.iLike]: `%${searchName}%`
      }
    };

    if (user.role === 'DEPARTMENT_MANAGER') {
      const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
      if (managerDept) {
        whereClause.departmentId = managerDept.id;
      } else {
        // Manager without a valid department shouldn't see anyone
        whereClause.departmentId = -1;
      }
    }

    const employee = await Employee.findOne({
      where: whereClause,
      include: [{
        model: Attendance,
        as: 'attendances',
        required: false
      }, {
        model: Department,
        as: 'department'
      }]
    });

    if (!employee) {
      const error = new Error('Employee not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    return await _generateEmployeeStatsAndSummary(employee);
  } catch (error) {
    throw error;
  }
};

const getEmployeeSummaryById = async (user, employeeId) => {
  try {
    const whereClause = { id: employeeId };

    if (user.role === 'DEPARTMENT_MANAGER') {
      const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
      if (managerDept) {
        whereClause.departmentId = managerDept.id;
      } else {
        whereClause.departmentId = -1;
      }
    }

    const employee = await Employee.findOne({
      where: whereClause,
      include: [{
        model: Attendance,
        as: 'attendances',
        required: false
      }, {
        model: Department,
        as: 'department'
      }]
    });

    if (!employee) {
      const error = new Error('Employee not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    return await _generateEmployeeStatsAndSummary(employee);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getOrganizationSummary,
  searchEmployeeSummary,
  getEmployeeSummaryById
};
