import type { RequestGenericInterface } from 'fastify';

export interface ReportIncidentRequest extends RequestGenericInterface {
  Body: {
    message: string;
    url: string;
  };
}
