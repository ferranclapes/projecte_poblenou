import {useState} from 'react';
import {theme} from '../styles.js';

function Calendar ({events, selectedDayStr, setSelectedDayStr}) {
    const [currentDate, setCurrentDate] = useState(new Date());

    //* Calculate the days of the week
  const getWeekDays = (baseDate) => {
    const current = new Date(baseDate);
    const day = current.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust for Sunday
    const monday = new Date(current.setDate(current.getDate() + diffToMonday));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  //* Change the current week by a given offset (in weeks)
  const changeWeek = (weekOffset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (weekOffset * 7));
    setCurrentDate(newDate);
  };

  
  //* Check if a given date has any events
  const dayHasEvents = (dateStr) => {
    return events.some(event => event.date_time.split('T')[0] === dateStr);
  };

  
  const weekDays = getWeekDays(currentDate);

  return (
    <div style={theme.calendar_container}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button onClick={() => changeWeek(-1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px', color: 'var(--text)' }}>⬅️</button>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-h)', textTransform: 'capitalize' }}>
        {weekDays[0].toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => changeWeek(1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px' }}>➡️</button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
        {weekDays.map((date) => {
        const dateStr = date.toISOString().split('T')[0];
        const isSelected = dateStr === selectedDayStr;
        const hasEvent = dayHasEvents(dateStr);
        const diaNum = date.getDate();
        const nomDia = date.toLocaleDateString('ca-ES', { weekday: 'narrow' });

        return (
            <div key={dateStr} onClick={() => setSelectedDayStr(dateStr)} style={{ padding: '10px 5px', borderRadius: '8px', cursor: 'pointer', background: isSelected ? 'var(--accent)' : 'transparent', color: isSelected ? 'var(--bg)' : 'var(--text)', transition: '0.2s', position: 'relative', fontWeight: isSelected ? 'bold' : 'normal' }}>
            <small style={{ display: 'block', fontSize: '10px', color: isSelected ? 'var(--bg)' : 'var(--text)', marginBottom: '4px' }}>{nomDia}</small>
            <span style={{ fontSize: '15px' }}>{diaNum}</span>
            {hasEvent && (
                <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? 'var(--bg)' : 'var(--accent)' }} />
            )}
            </div>
        );
        })}
    </div>
    </div>
  );
}
export default Calendar;