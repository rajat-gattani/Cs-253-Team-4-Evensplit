import React, { useState, useEffect } from 'react';
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'


function App() {

  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);

  const fetchEventData = async () => {
    await fetch('http://localhost:1337/api/getEvents', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('token'),
        }
    }).then(res => {
      return res.json()
    }).then(data => {
      var i;
      var events = [];
      for(i=0;i<data.events.length;i++){
        var start_date = new Date(data.events[i].start_time)
        var end_date = new Date(data.events[i].end_time)
        if(start_date.getHours() === 0 && start_date.getMinutes() === 0 && start_date.getSeconds() === 0 && end_date.getHours() === 0 && end_date.getMinutes() === 0 && end_date.getSeconds() === 0){
          start_date.setDate(start_date.getDate() + 1);
          end_date.setDate(end_date.getDate() + 1);
          events.push({id: data.events[i]._id, title: data.events[i].name, start: start_date.toISOString().replace(/T.*$/, ''), end: end_date.toISOString().replace(/T.*$/, ''), description: data.events[i].description});
        }
        else{
          events.push({id: data.events[i]._id, title: data.events[i].name, start: data.events[i].start_time, end: data.events[i].end_time, description: data.events[i].description});
        }
      }
      console.log(events)
      setCurrentEvents(events);
    })
  }

  useEffect(() => {
    if(window.localStorage.getItem('token') == null || window.localStorage.getItem('user') == null) window.location.href="/"
    fetchEventData()
  }, []);

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  }

  const handleDateSelect = (selectInfo) => {
    let title = prompt('Please enter a new title for your event')
    var description;
    if(title) description = prompt('Please enter a description for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        description,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      })
    }
  }

  const handleEventClick = (clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove()
    }
  }

  const handleEvents = (events) => {
    setCurrentEvents(events);
  }

  const renderEventContent = (eventInfo) => {
    return (
      <>        
        <code title={eventInfo.event._def.extendedProps.description}>
          <b>{eventInfo.timeText} </b>
          <i>{eventInfo.event.title}</i>
        </code>
      </>
    )
  }

  const renderSidebarEvent = (event) => {
    return (
      <li key={event.id}>
        <b>{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
        <i>{event.title}</i>
      </li>
    )
  }

    return (
      <div className='demo-app'>
        <Navbar/>
        {/* {this.renderSidebar()} */}
        <div className='demo-app-main'>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView='dayGridMonth'
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={weekendsVisible}
            events={currentEvents} 
            select={handleDateSelect}
            eventContent={renderEventContent} // custom render function
            eventClick={handleEventClick}
            // eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            // you can update a remote database when these fire:
            eventAdd={async (e) => {
              console.log(e.event._def.extendedProps.description)
              console.log(e.event.start);
              console.log(e.event.end);
              var start_time = e.event.start;
              var end_time = e.event.end;
              await fetch('http://localhost:1337/api/addEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                  },
                body: JSON.stringify({
                  name: e.event.title,
                  start_time: start_time,
                  end_time: end_time,
                  description: e.event._def.extendedProps.description,
                  relevant_tags: "Relevant Tags go here",
              }),
              }).then(res => {
                return res.json()
              }).then(data => {
                if(data.status == 'error') window.location.href = "/";
              })
            }}
            eventChange={async (e) => {
              console.log(e.event.start);
              console.log(e.event.end);
              var start_time = e.event.start;
              var end_time = e.event.end;
              await fetch('http://localhost:1337/api/addEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                  },
                body: JSON.stringify({
                  name: e.event.title,
                  start_time: start_time,
                  end_time: end_time,
                  description: "Description goes here",
                  relevant_tags: "Relevant Tags go here",
              }),
              }).then(res => {
                return res.json()
              }).then(data => {
                if(data.status == 'error') window.location.href = "/";
              }).then(fetch('http://localhost:1337/api/deleteEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                  },
                body: JSON.stringify({
                  eventId: e.oldEvent.id,
              }),
              }).then(res => {
                return res.json()
              }).then(data => {
                if(data.status == 'error' && data.error != 'unauthorized access') window.location.href = "/";
                window.location.reload();
              }))
            }}
            eventRemove={async (e) => {
              await fetch('http://localhost:1337/api/deleteEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                  },
                body: JSON.stringify({
                  eventId: e.event.id,
              }),
              }).then(res => {
                return res.json()
              }).then(data => {
                if(data.status == 'error' && data.error != 'unauthorized access') window.location.href = "/";
                window.location.reload();
              })
            }}
           />
           <Footer/>
        </div>
      </div>

    )
}

export default App;
 