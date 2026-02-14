/**
 * ============================================================================
 * SIMPLE IN-MEMORY CACHE
 * For caching frequently accessed data (faculties, departments, levels)
 * ============================================================================
 */

class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time to live
    }

    /**
     * Set cache with TTL (in seconds)
     */
    set(key, value, ttlSeconds = 3600) {
        this.cache.set(key, value);
        
        const expiryTime = Date.now() + (ttlSeconds * 1000);
        this.ttl.set(key, expiryTime);

        // Auto-cleanup after TTL
        setTimeout(() => {
            this.delete(key);
        }, ttlSeconds * 1000);

        return true;
    }

    /**
     * Get cached value
     */
    get(key) {
        // Check if expired
        const expiry = this.ttl.get(key);
        if (expiry && Date.now() > expiry) {
            this.delete(key);
            return null;
        }

        return this.cache.get(key);
    }

    /**
     * Check if key exists
     */
    has(key) {
        const expiry = this.ttl.get(key);
        if (expiry && Date.now() > expiry) {
            this.delete(key);
            return false;
        }

        return this.cache.has(key);
    }

    /**
     * Delete cache entry
     */
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
        return true;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
        return true;
    }

    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }

    /**
     * Get or set pattern - get from cache or compute and cache
     */
    async getOrSet(key, computeFn, ttlSeconds = 3600) {
        // Try to get from cache
        if (this.has(key)) {
            const cached = this.get(key);
            if (cached !== null) {
                console.log(`💾 Cache HIT: ${key}`);
                return cached;
            }
        }

        // Not in cache, compute value
        console.log(`🔄 Cache MISS: ${key} - Computing...`);
        const value = await computeFn();
        
        // Store in cache
        this.set(key, value, ttlSeconds);
        
        return value;
    }
}

// Export singleton instance
const cache = new SimpleCache();

// Cache keys
const CACHE_KEYS = {
    FACULTIES: 'faculties:all',
    FACULTY: (id) => `faculty:${id}`,
    DEPARTMENTS: (facultyId) => `departments:faculty:${facultyId}`,
    DEPARTMENT: (id) => `department:${id}`,
    LEVELS: (departmentId) => `levels:department:${departmentId}`,
    LEVEL: (id) => `level:${id}`,
    USER_CONTEXT: (userId) => `user:context:${userId}`
};

module.exports = {
    cache,
    CACHE_KEYS
};
