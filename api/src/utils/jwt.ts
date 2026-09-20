import { IJwtPayload } from "../types/jwt.type.js";

export function isJWTPayload(payload: any): payload is IJwtPayload {
    return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload._id === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string'
  );
}