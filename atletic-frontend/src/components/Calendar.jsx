import {useState} from 'react';
import {theme} from '../styles.js';

function Calendar ({events, selectedDayStr, setSelectedDayStr}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewIsMonth, setViewIsMonth] = useState(false);
  const today = new Date();

  const getMonday = (baseDate) => {
    const current = new Date(baseDate);
    const day = current.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return new Date(current.setDate(current.getDate() + diffToMonday));
  };

  //* Calculate the days of the week
  const getWeekDays = (baseDate) => {
    const monday = getMonday(baseDate);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  //* Calculate the days of the month
  const getMonthDays = (baseDate) => {
    const month = baseDate.getMonth();
    let startCalculations;
    if (viewIsMonth) {
      const year = baseDate.getFullYear();
      const firstDayOfMonth = new Date(year, month, 1);
      startCalculations = getMonday(firstDayOfMonth);
    }
    else {
      const monday = getMonday(baseDate);
      startCalculations = new Date(monday);
    }

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startCalculations);
      d.setDate(startCalculations.getDate() + i);
      if (d.getMonth() > month && d.getDay() === 1) break;
      days.push(d);
    }
    return days;
  };

  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewIsMonth) {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  
  //* Check if a given date has any events
  const dayHasEvents = (dateStr) => {
    return events.some(event => event.date_time.split('T')[0] === dateStr);
  };

  
  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);

  const displayedDays = monthDays;
  const titleDate = viewIsMonth ? currentDate : weekDays[0];

  const numRows = Math.ceil(monthDays.length / 7);
  const calculatedMaxHeight = viewIsMonth ? `${(numRows * 40) + (numRows * 4)}px` : '40px';

  return (
    <div style={{...theme.calendar_container, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden'}}>
      
      {/* Week Navigation */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button onClick={() => handleNavigate(-1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px', color: 'var(--text)' }}>⬅️</button>
        <span 
          onClick={() => setViewIsMonth(!viewIsMonth)} // 💡 Un clic al títol alterna la vista!
          style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-h)', textTransform: 'capitalize', cursor: 'pointer', userSelect: 'none' }}
        >
          {titleDate.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })} {viewIsMonth ? '▲' : '▼'}
        </span>
        <button onClick={() => handleNavigate(1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px' }}>➡️</button>
    </div>

    {/* Day Names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', marginBottom: '4px' }}>
        {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map((d, index) => (
          <small key={index} style={{ fontSize: '10px', color: 'var(--text)', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {d}
          </small>
        ))}
      </div>

    {/* Display Days */}
    <div style={{...theme.calendar_days_container, maxHeight: calculatedMaxHeight}}>
        {displayedDays.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDayStr;
          const hasEvent = dayHasEvents(dateStr);
          const diaNum = date.getDate();

          // Comprovem si el dia pertany al mes en curs (per enfosquir els dels mesos passats/futurs)
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();

          const isRowVisible = viewIsMonth || index < 7;

        return (
            <div 
              key={dateStr} 
              onClick={() => setSelectedDayStr(dateStr)} 
              style={{ ...theme.calendar_day,
                border: date.getDate() === today.getDate() && date.getMonth() === today.getMonth() ? '1px solid #000000':'none',
                background: isSelected ? 'var(--accent)' : 'transparent', 
                color: isSelected ? '#ffffff' : (isCurrentMonth ? '#000000' : (!viewIsMonth ? 'var(--text)' : 'rgba(120,120,120,0.4)')),
                fontWeight: isSelected ? 'bold' : 'normal',
                opacity: isRowVisible ? 1 : 0
              }}
            >
              <span style={{ fontSize: '14px' }}>{diaNum}</span>
              
              {/* El puntet d'assistència/esdeveniment */}
              {hasEvent && (
                <span style={{...theme.calendar_dot, background: isSelected ? 'var(--bg)' : 'var(--accent)' 
                }} />
              )}
            </div>
          );
        })}
    </div>
    </div>
  );
}
export default Calendar;