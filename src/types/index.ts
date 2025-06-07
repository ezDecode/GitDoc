export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type Document = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
};
