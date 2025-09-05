import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/responses.js';

const prisma = new PrismaClient();

// Get all regions with their destinations (Public)
export const getRegionsWithDestinations = async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      where: { isActive: true },
      include: {
        destinations: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        children: {
          where: { isActive: true },
          include: {
            destinations: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      where: {
        isActive: true,
        parentId: null // Only get top-level regions
      },
      orderBy: { sortOrder: 'asc' }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(regions, 'Regions with destinations retrieved successfully')
    );

  } catch (error) {
    console.error('Get regions with destinations error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve regions with destinations', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get destinations by region (Public)
export const getDestinationsByRegion = async (req, res) => {
  try {
    const { regionSlug } = req.params;

    const region = await prisma.region.findUnique({
      where: { slug: regionSlug, isActive: true },
      include: {
        destinations: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!region) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Region not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      successResponse(region.destinations, 'Destinations retrieved successfully')
    );

  } catch (error) {
    console.error('Get destinations by region error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve destinations', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Create region (Admin only)
export const createRegion = async (req, res) => {
  try {
    const { name, slug, description, image, parentId, sortOrder } = req.body;

    const region = await prisma.region.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId,
        sortOrder: sortOrder || 0
      }
    });

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse(region, 'Region created successfully')
    );

  } catch (error) {
    console.error('Create region error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create region', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Create destination (Admin only)
export const createDestination = async (req, res) => {
  try {
    const { name, slug, description, image, regionId, sortOrder } = req.body;

    const destination = await prisma.destination.create({
      data: {
        name,
        slug,
        description,
        image,
        regionId,
        sortOrder: sortOrder || 0
      },
      include: {
        region: true
      }
    });

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse(destination, 'Destination created successfully')
    );

  } catch (error) {
    console.error('Create destination error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create destination', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update region (Admin only)
export const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, isActive, sortOrder } = req.body;

    const region = await prisma.region.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(sortOrder !== undefined && { sortOrder })
      }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(region, 'Region updated successfully')
    );

  } catch (error) {
    console.error('Update region error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update region', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update destination (Admin only)
export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, isActive, sortOrder, propertyCount } = req.body;

    const destination = await prisma.destination.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(propertyCount !== undefined && { propertyCount })
      },
      include: {
        region: true
      }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(destination, 'Destination updated successfully')
    );

  } catch (error) {
    console.error('Update destination error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update destination', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete region (Admin only)
export const deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if region has destinations
    const destinationCount = await prisma.destination.count({
      where: { regionId: parseInt(id) }
    });

    if (destinationCount > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot delete region with existing destinations', HTTP_STATUS.BAD_REQUEST)
      );
    }

    await prisma.region.delete({
      where: { id: parseInt(id) }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(null, 'Region deleted successfully')
    );

  } catch (error) {
    console.error('Delete region error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete region', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete destination (Admin only)
export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.destination.delete({
      where: { id: parseInt(id) }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(null, 'Destination deleted successfully')
    );

  } catch (error) {
    console.error('Delete destination error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete destination', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get all regions (Admin only)
export const getAllRegions = async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      include: {
        destinations: true,
        children: {
          include: {
            destinations: true
          }
        },
        parent: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(regions, 'All regions retrieved successfully')
    );

  } catch (error) {
    console.error('Get all regions error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve regions', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get all destinations (Admin only)
export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      include: {
        region: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(destinations, 'All destinations retrieved successfully')
    );

  } catch (error) {
    console.error('Get all destinations error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve destinations', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};
