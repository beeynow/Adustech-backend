/**
 * ============================================================================
 * ERROR HANDLER MIDDLEWARE
 * Centralized error handling for the application
 * ============================================================================
 */

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error) => {
    if (error.code === 'P2002') {
        return {
            status: 409,
            message: 'A record with this value already exists',
            field: error.meta?.target?.[0] || 'unknown'
        };
    }

    if (error.code === 'P2025') {
        return {
            status: 404,
            message: 'Record not found',
            details: error.meta?.cause || 'The requested resource does not exist'
        };
    }

    if (error.code === 'P2003') {
        return {
            status: 400,
            message: 'Invalid reference',
            details: 'The referenced record does not exist'
        };
    }

    if (error.code === 'P2014') {
        return {
            status: 400,
            message: 'Relation violation',
            details: 'Cannot perform this operation due to related records'
        };
    }

    return {
        status: 500,
        message: 'Database error',
        details: error.message
    };
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error occurred:', err);

    // Prisma errors
    if (err.code && err.code.startsWith('P')) {
        const prismaError = handlePrismaError(err);
        return res.status(prismaError.status).json({
            success: false,
            error: prismaError.message,
            details: prismaError.details || prismaError.field,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            details: err.message
        });
    }

    // Default error
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err
        })
    });
};

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not found handler
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

module.exports = {
    errorHandler,
    asyncHandler,
    notFound,
    handlePrismaError
};
