import { Router, Response } from 'express';
import { authService, AuthRequest } from '../auth/auth.js';
import { database, CalendarEvent, User as DatabaseUser } from '../database/database.js';

const router = Router();

// Get user's calendar events
router.get('/events', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { start, end, category } = req.query;

    let events: CalendarEvent[];

    if (start && end) {
      events = await database.getEventsByUser(userId, start as string, end as string);
    } else {
      events = await database.getEventsByUser(userId);
    }

    // Filter by category if specified
    if (category) {
      events = events.filter(event => event.event_type === category);
    }

    res.json({
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start_datetime,
        end: event.end_datetime,
        timezone: event.timezone,
        allDay: event.is_all_day,
        isHoliday: event.is_holiday,
        holidayCountry: event.holiday_country,
        location: event.location,
        type: event.event_type,
        googleEventId: event.google_event_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at
      }))
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events' 
    });
  }
});

// Create new calendar event
router.post('/events', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      start,
      end,
      timezone,
      allDay = false,
      location,
      type = 'personal'
    } = req.body;

    // Validate required fields
    if (!title || !start || !end) {
      return res.status(400).json({ 
        error: 'Title, start time, and end time are required' 
      });
    }

    // Validate dates
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format' 
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ 
        error: 'End time must be after start time' 
      });
    }

    // Create event
    const eventId = await database.createEvent({
      user_id: userId,
      title,
      description,
      start_datetime: start,
      end_datetime: end,
      timezone: timezone || 'UTC',
      is_all_day: allDay,
      location,
      event_type: type
    });

    // Get created event
    const events = await database.getEventsByUser(userId);
    const createdEvent = events.find(e => e.id === eventId);

    res.status(201).json({
      message: 'Event created successfully',
      event: createdEvent ? {
        id: createdEvent.id,
        title: createdEvent.title,
        description: createdEvent.description,
        start: createdEvent.start_datetime,
        end: createdEvent.end_datetime,
        timezone: createdEvent.timezone,
        allDay: createdEvent.is_all_day,
        location: createdEvent.location,
        type: createdEvent.event_type,
        createdAt: createdEvent.created_at
      } : null
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      error: 'Failed to create event' 
    });
  }
});

// Update calendar event
router.put('/events/:id', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const {
      title,
      description,
      start,
      end,
      timezone,
      allDay,
      location,
      type
    } = req.body;

    // Validate event ID
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        error: 'Invalid event ID' 
      });
    }

    // Check if event exists and belongs to user
    const events = await database.getEventsByUser(userId);
    const existingEvent = events.find(e => e.id === eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }

    // Validate dates if provided
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format' 
        });
      }

      if (startDate >= endDate) {
        return res.status(400).json({ 
          error: 'End time must be after start time' 
        });
      }
    }

    // Update event
    await database.updateEvent(eventId, {
      title: title || existingEvent.title,
      description: description !== undefined ? description : existingEvent.description,
      start_datetime: start || existingEvent.start_datetime,
      end_datetime: end || existingEvent.end_datetime,
      timezone: timezone || existingEvent.timezone,
      is_all_day: allDay !== undefined ? allDay : existingEvent.is_all_day,
      location: location !== undefined ? location : existingEvent.location,
      event_type: type || existingEvent.event_type
    });

    res.json({
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      error: 'Failed to update event' 
    });
  }
});

// Delete calendar event
router.delete('/events/:id', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);

    // Validate event ID
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        error: 'Invalid event ID' 
      });
    }

    // Check if event exists and belongs to user
    const events = await database.getEventsByUser(userId);
    const existingEvent = events.find(e => e.id === eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }

    // Delete event
    await database.deleteEvent(eventId);

    res.json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      error: 'Failed to delete event' 
    });
  }
});

// Get holidays for a country
router.get('/holidays/:country', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { country } = req.params;
    const { year } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    
    if (isNaN(currentYear)) {
      return res.status(400).json({ 
        error: 'Invalid year' 
      });
    }

    const holidays = await database.getHolidaysByCountry(country.toUpperCase(), currentYear);

    res.json({
      country: country.toUpperCase(),
      year: currentYear,
      holidays: holidays.map(holiday => ({
        id: holiday.id,
        name: holiday.holiday_name,
        date: holiday.holiday_date,
        type: holiday.holiday_type
      }))
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch holidays' 
    });
  }
});

// Sync holidays to user calendar
router.post('/holidays/:country/sync', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { country } = req.params;
    const { year } = req.body;

    const currentYear = year || new Date().getFullYear();
    
    // Get holidays for the country
    const holidays = await database.getHolidaysByCountry(country.toUpperCase(), currentYear);

    // Create calendar events for holidays
    const createdEvents = [];
    for (const holiday of holidays) {
      const startDate = new Date(holiday.holiday_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const eventId = await database.createEvent({
        user_id: userId,
        title: holiday.holiday_name,
        description: `${holiday.holiday_name} - ${country.toUpperCase()} Public Holiday`,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        timezone: 'UTC',
        is_all_day: true,
        is_holiday: true,
        holiday_country: country.toUpperCase(),
        event_type: 'holiday'
      });

      createdEvents.push(eventId);
    }

    res.json({
      message: `Synced ${createdEvents.length} holidays to calendar`,
      country: country.toUpperCase(),
      year: currentYear,
      eventsCreated: createdEvents.length
    });
  } catch (error) {
    console.error('Sync holidays error:', error);
    res.status(500).json({ 
      error: 'Failed to sync holidays' 
    });
  }
});

// Get calendar statistics
router.get('/stats', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const events = await database.getEventsByUser(userId);

    const stats = {
      totalEvents: events.length,
      personalEvents: events.filter(e => e.event_type === 'personal').length,
      meetingEvents: events.filter(e => e.event_type === 'meeting').length,
      holidayEvents: events.filter(e => e.is_holiday).length,
      upcomingEvents: events.filter(e => new Date(e.start_datetime) > new Date()).length,
      pastEvents: events.filter(e => new Date(e.start_datetime) < new Date()).length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get calendar stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar statistics' 
    });
  }
});

export default router;
