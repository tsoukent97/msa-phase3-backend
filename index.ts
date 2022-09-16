import { ApolloServer, gql } from "apollo-server-express";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const typeDefs = gql`
  type aircraft_data {
    model: String
    range: String
  }

  type airport_data {
    airport_name: String
    timezone: String
  }
  
  type nba_data {
    player_name: String
    player_team: String
  }

  type Query {
    aircrafts_data: [aircraft_data]
    airplanes_data: [airport_data]
    nba_data: [nba_data]
  }
`;

const resolvers = {
    Query: {
        aircrafts_data: async () => await prisma.aircrafts_data.findMany(),
        airplanes_data: async () => await prisma.airports_data.findMany(),
        nba_data: async () => await prisma.nba_data.findMany()
      },
  };

  async function startApolloServer(typeDefs: any, resolvers: any) {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      csrfPrevention: true,
      cache: "bounded",
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
      introspection: false,
    });
    await server.start();
    server.applyMiddleware({ app, path: '/' });
    const PORT = process.env.PORT || 4000;
    await new Promise<void>((resolve) =>
      httpServer.listen({ port: PORT }, resolve)
    );
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  }

startApolloServer(typeDefs, resolvers);