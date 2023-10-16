import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Intercept an outgoing HTTP request and modify it.
   * @param req - The outgoing request.
   * @param next - The next interceptor in the chain.
   * @returns - An observable of the event stream.
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request to add the "withCredentials" flag
    const authenticatedRequest = req.clone({ withCredentials: true });
    console.log(authenticatedRequest);
    // Pass the modified request to the next interceptor in the chain
    return next.handle(authenticatedRequest);
  }
}
