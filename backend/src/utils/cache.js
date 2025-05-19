/**
 * Cache Manager
 * 성능 최적화를 위한 캐싱 시스템
 */
const NodeCache = require('node-cache');
const redis = require('redis');
const { promisify } = require('util');
const config = require('../config/config');
const { logger } = require('./logger');

class CacheManager {
  constructor() {
    // 환경 설정 확인
    this.useRedis = process.env.USE_REDIS === 'true';
    this.fallbackToLocal = false;
    
    if (this.useRedis) {
      // Redis 클라이언트 설정
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis connection refused. Falling back to local cache.');
            this.fallbackToLocal = true;
            this._setupLocalCache();
            return false; // Stop retrying
          }
          // Exponential backoff
          return Math.min(options.attempt * 100, 3000);
        }
      });
      
      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        // Redis 연결 실패 시 로컬 캐시로 폴백
        if (!this.fallbackToLocal) {
          this.fallbackToLocal = true;
          this._setupLocalCache();
        }
      });
      
      this.client.on('ready', () => {
        logger.info('Redis connection established');
        this.fallbackToLocal = false;
      });
      
      // Redis 메소드 프로미스화
      this.getAsync = promisify(this.client.get).bind(this.client);
      this.setAsync = promisify(this.client.set).bind(this.client);
      this.delAsync = promisify(this.client.del).bind(this.client);
      this.scanAsync = promisify(this.client.scan).bind(this.client);
    } else {
      // 로컬 캐시 사용
      this._setupLocalCache();
    }
  }

  // 로컬 캐시 초기화
  _setupLocalCache() {
    this.localCache = new NodeCache({ 
      stdTTL: 600, // 기본 10분
      checkperiod: 60,
      useClones: false // 성능 향상을 위해 클론 비활성화
    });
    
    logger.info('Local cache initialized');
  }

  // 데이터 가져오기
  async get(key, defaultValue = null) {
    try {
      if (this.useRedis && !this.fallbackToLocal) {
        const data = await this.getAsync(key);
        if (data) {
          try {
            return JSON.parse(data);
          } catch (e) {
            logger.warn(`Failed to parse Redis data for key: ${key}`);
            return data; // Return raw data if parsing fails
          }
        }
        return defaultValue;
      } else {
        const value = this.localCache.get(key);
        return value !== undefined ? value : defaultValue;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return defaultValue;
    }
  }

  // 데이터 저장하기
  async set(key, value, ttl = 600) {
    try {
      if (this.useRedis && !this.fallbackToLocal) {
        let valueToStore = value;
        if (typeof value === 'object') {
          valueToStore = JSON.stringify(value);
        }
        await this.setAsync(key, valueToStore, 'EX', ttl);
      } else {
        this.localCache.set(key, value, ttl);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  // 데이터 삭제하기
  async del(key) {
    try {
      if (this.useRedis && !this.fallbackToLocal) {
        await this.delAsync(key);
      } else {
        this.localCache.del(key);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  // 특정 패턴의 캐시 무효화
  async invalidatePattern(pattern) {
    try {
      if (this.useRedis && !this.fallbackToLocal) {
        // Redis 패턴 검색 및 삭제
        let cursor = '0';
        
        do {
          const [nextCursor, keys] = await this.scanAsync(cursor, 'MATCH', pattern);
          cursor = nextCursor;
          
          if (keys.length) {
            await this.delAsync(keys);
            logger.info(`Invalidated ${keys.length} cache keys with pattern: ${pattern}`);
          }
        } while (cursor !== '0');
      } else {
        // 로컬 캐시에서 패턴 매칭 삭제
        const keys = this.localCache.keys();
        const regexPattern = new RegExp(pattern.replace('*', '.*'));
        let counter = 0;
        
        for (const key of keys) {
          if (regexPattern.test(key)) {
            this.localCache.del(key);
            counter++;
          }
        }
        
        if (counter > 0) {
          logger.info(`Invalidated ${counter} cache keys with pattern: ${pattern}`);
        }
      }
      return true;
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
      return false;
    }
  }
  
  // 캐시 상태 확인
  async getStats() {
    if (this.useRedis && !this.fallbackToLocal) {
      // Redis 통계는 복잡하므로 간단한 정보만 반환
      return {
        type: 'redis',
        connected: !this.fallbackToLocal,
        host: process.env.REDIS_HOST || 'localhost'
      };
    } else {
      const stats = this.localCache.getStats();
      return {
        type: 'local',
        hits: stats.hits,
        misses: stats.misses,
        keys: stats.keys,
        ksize: stats.ksize,
        vsize: stats.vsize
      };
    }
  }
  
  // 모든 캐시 초기화
  async flush() {
    try {
      if (this.useRedis && !this.fallbackToLocal) {
        await promisify(this.client.flushdb).bind(this.client)();
        logger.info('Redis cache flushed');
      } else {
        this.localCache.flushAll();
        logger.info('Local cache flushed');
      }
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

module.exports = new CacheManager();
