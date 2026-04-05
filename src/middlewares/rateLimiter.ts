import { Request } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis";


// 🔥 1. IP-based limiter
export const ipLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown-ip'; // identify by IP, with fallback
  },
  message: "Too many requests from this IP, please try later",
});


// 🔥 2. User-based limiter
export const userLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 booking attempts per user
  keyGenerator: (req: Request) => {
    // assuming userId is coming from body or auth
    return req.body.userId || req.ip;
  },
  message: "Too many booking attempts for this user, please try later",
});

// 🔥 3. Redis-backed limiter for distributed environments
export const userRedisLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => {
      const [command, ...rest] = args;
      return (redis.call(command, ...rest) as unknown) as Promise<any>;
    },
  }),
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req: any) => req.body.userId || req.ip,
});