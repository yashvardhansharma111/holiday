import { z } from 'zod';
import prisma from '../db.js';
import { HTTP_STATUS, errorResponse, successResponse, ERROR_MESSAGES } from '../utils/responses.js';
import { createEventSchema, updateEventSchema } from '../schemas/index.js';

// List events with basic filters and pagination
export const listEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, city, country, startFrom, endTo } = req.query;

    const where = {};
    if (category) where.category = String(category);
    if (city) where.city = { contains: String(city), mode: 'insensitive' };
    if (country) where.country = { contains: String(country), mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { tags: { hasSome: [String(search)] } },
      ];
    }
    if (startFrom) where.startDateTime = { gte: new Date(String(startFrom)) };
    if (endTo) where.endDateTime = { lte: new Date(String(endTo)) };

    const total = await prisma.event.count({ where });
    const events = await prisma.event.findMany({
      where,
      orderBy: { startDateTime: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.json(successResponse({ data: events, pagination: { total, page: Number(page), limit: Number(limit) } }, 'Events retrieved'));
  } catch (error) {
    console.error('listEvents error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to retrieve events', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

export const getEventById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse('Event not found', HTTP_STATUS.NOT_FOUND));
    return res.json(successResponse(event, 'Event retrieved'));
  } catch (error) {
    console.error('getEventById error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to retrieve event', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

export const createEvent = async (req, res) => {
  try {
    // Only SUPER_ADMIN should hit this (route guarded); still enforce here
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const data = createEventSchema.parse(req.body);
    if (new Date(data.endDateTime) < new Date(data.startDateTime)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('endDateTime must be after startDateTime', HTTP_STATUS.BAD_REQUEST));
    }

    const created = await prisma.event.create({
      data: {
        title: data.title.trim(),
        description: data.description || null,
        category: data.category || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        timezone: data.timezone || null,
        images: data.images || [],
        tags: data.tags || [],
        createdBy: req.user.id,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json(successResponse(created, 'Event created', HTTP_STATUS.CREATED));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors));
    }
    console.error('createEvent error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to create event', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

export const updateEvent = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }
    const id = Number(req.params.id);
    const data = updateEventSchema.parse(req.body);

    if (data.startDateTime && data.endDateTime && new Date(data.endDateTime) < new Date(data.startDateTime)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('endDateTime must be after startDateTime', HTTP_STATUS.BAD_REQUEST));
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title != null ? { title: data.title.trim() } : {}),
        description: data.description != null ? data.description : undefined,
        category: data.category != null ? data.category : undefined,
        latitude: data.latitude != null ? data.latitude : undefined,
        longitude: data.longitude != null ? data.longitude : undefined,
        address: data.address != null ? data.address : undefined,
        city: data.city != null ? data.city : undefined,
        state: data.state != null ? data.state : undefined,
        country: data.country != null ? data.country : undefined,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : undefined,
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : undefined,
        timezone: data.timezone != null ? data.timezone : undefined,
        images: Array.isArray(data.images) ? data.images : undefined,
        tags: Array.isArray(data.tags) ? data.tags : undefined,
      },
    });

    return res.json(successResponse(updated, 'Event updated'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors));
    }
    console.error('updateEvent error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to update event', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

export const deleteEvent = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }
    const id = Number(req.params.id);
    await prisma.event.delete({ where: { id } });
    return res.json(successResponse(null, 'Event deleted'));
  } catch (error) {
    console.error('deleteEvent error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to delete event', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
