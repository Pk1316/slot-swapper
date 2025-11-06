import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import api from '../api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events').then(res => {
      setEvents(res.data.map(e => ({
        id: e._id,
        title: `${e.title} (${e.status})`,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        allDay: false,
      })));
    });
  }, []);

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
