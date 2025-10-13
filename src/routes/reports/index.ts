import type { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { sendDiscordMessage } from '@services/DiscordWebhook';
import { Error400Default, Error503Default } from '@customtypes/errors';
import type { ReportIncidentRequest } from '@customtypes/requests/reports';

const routes: FastifyPluginAsync = async (server) => {
  server.post<ReportIncidentRequest, { Reply }>(
    '/',
    {
      schema: {
        description: 'Report an incident',
        summary: 'reportIncident',
        operationId: 'reportIncident',
        tags: ['reports'],
        body: {
          type: 'object',
          required: ['message', 'url'],
          properties: {
            message: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
          },
        },
        response: {
          201: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      const message: string | undefined = request.body?.message;
      const url: string | undefined = request.body?.url;

      if (!message || !url) {
        return reply.code(400).send();
      }

      sendDiscordMessage(
        JSON.stringify({
          content: `URL: ${url}\nMessage: ${message}`,
          username: 'stiletto.live',
          tts: true,
        }),
      );

      return reply.code(201).send({
        message: 'Incident reported',
      });
    },
  );
};

export default routes;
