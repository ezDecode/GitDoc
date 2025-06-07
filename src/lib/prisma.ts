// Mock Prisma client for use without database
// This file replaces the actual Prisma client with a simple mock
// for the JWT-only authentication flow

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  repositoryUrl?: string;
  repositoryName?: string;
  format?: string;
}

// Mock implementation of Prisma client for document storage
export const prisma = {
  document: {
    create: async (data: any) => {
      console.log("Mock document create:", data);
      return {
        id: `mock-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    findMany: async (params: any) => {
      console.log("Mock findMany called with:", params);
      return []; // Return empty array as mock
    },
    findUnique: async (params: any) => {
      console.log("Mock findUnique called with:", params);
      return null; // Return null as mock
    },
    update: async (params: any) => {
      console.log("Mock update called with:", params);
      return {
        id: params.where.id,
        ...params.data,
        updatedAt: new Date(),
      };
    },
    delete: async (params: any) => {
      console.log("Mock delete called with:", params);
      return { id: params.where.id };
    },
  },
};
