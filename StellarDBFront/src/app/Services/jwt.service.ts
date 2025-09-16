import { Injectable } from '@angular/core';

export interface JwtHeader {
  alg: string;
  typ: string;
  kid?: string;
}

export interface JwtPayload {
  [key: string]: any;
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  exp?: number; // Expiration Time
  nbf?: number; // Not Before
  iat?: number; // Issued At
  jti?: string; // JWT ID
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  /**
   * Fully decodes a JWT token including header, payload, and signature
   * @param token The JWT token to decode
   * @returns Decoded JWT object or null if invalid
   */
  decodeJwtFull(token: string): DecodedJwt | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format: token must have 3 parts');
      }

      const header = this.decodeJwtPart(parts[0]) as JwtHeader;
      const payload = this.decodeJwtPart(parts[1]) as JwtPayload;
      const signature = parts[2];

      return {
        header,
        payload,
        signature
      };
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Decodes only the payload of a JWT token
   * @param token The JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      return this.decodeJwtPart(parts[1]) as JwtPayload;
    } catch (error) {
      console.error('Error decoding JWT payload:', error);
      return null;
    }
  }

  /**
   * Decodes only the header of a JWT token
   * @param token The JWT token to decode
   * @returns Decoded header or null if invalid
   */
  decodeJwtHeader(token: string): JwtHeader | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      return this.decodeJwtPart(parts[0]) as JwtHeader;
    } catch (error) {
      console.error('Error decoding JWT header:', error);
      return null;
    }
  }

  /**
   * Helper method to decode a specific part of the JWT
   * @param encodedPart The base64url encoded part of the JWT
   * @returns Decoded object
   */
  private decodeJwtPart(encodedPart: string): any {
    // Convert base64url to base64
    const base64 = encodedPart
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    // Decode and parse
    const decoded = atob(padded);
    return JSON.parse(decoded);
  }

  /**
   * Checks if a JWT token is expired
   * @param token The JWT token to check
   * @returns true if expired, false if valid, null if cannot determine
   */
  isTokenExpired(token: string): boolean | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) {
      return null; // Cannot determine expiration
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Gets the remaining time until token expiration
   * @param token The JWT token to check
   * @returns Remaining time in milliseconds, or null if cannot determine
   */
  getTimeUntilExpiration(token: string): number | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) {
      return null;
    }

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeRemaining = expirationTime - currentTime;

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Formats the time until expiration in a human-readable format
   * @param token The JWT token to check
   * @returns Formatted time string or null if cannot determine
   */
  getFormattedTimeUntilExpiration(token: string): string | null {
    const timeRemaining = this.getTimeUntilExpiration(token);
    if (timeRemaining === null) {
      return null;
    }

    if (timeRemaining === 0) {
      return 'Expired';
    }

    const seconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Extracts specific claims from a JWT token
   * @param token The JWT token to examine
   * @param claimName The name of the claim to extract
   * @returns The claim value or null if not found
   */
  getClaim(token: string, claimName: string): any {
    const payload = this.decodeJwtPayload(token);
    return payload?.[claimName] || null;
  }

  /**
   * Validates the basic structure of a JWT token
   * @param token The token to validate
   * @returns true if the token has valid structure
   */
  isValidJwtStructure(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Try to decode each part
      this.decodeJwtPart(parts[0]);
      this.decodeJwtPart(parts[1]);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets token information in a formatted object
   * @param token The JWT token to analyze
   * @returns Token information object
   */
  getTokenInfo(token: string): any {
    const decoded = this.decodeJwtFull(token);
    if (!decoded) {
      return null;
    }

    return {
      header: decoded.header,
      payload: decoded.payload,
      isExpired: this.isTokenExpired(token),
      timeUntilExpiration: this.getFormattedTimeUntilExpiration(token),
      issuedAt: decoded.payload.iat ? new Date(decoded.payload.iat * 1000) : null,
      expiresAt: decoded.payload.exp ? new Date(decoded.payload.exp * 1000) : null,
      issuer: decoded.payload.iss,
      subject: decoded.payload.sub,
      audience: decoded.payload.aud
    };
  }
}
