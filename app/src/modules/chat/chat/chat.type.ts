export interface Chat {
  id: number;

  user1Id: number;
  user2Id: number;

  createdAt: Date;
  updatedAt: Date;

  user1: UserPreview;

  user2: UserPreview;

  messages: {
    id: number;
    authorId: number;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}[]


export type UserPreview = {
  id: number;
  login: string;
  name: string | null;
  avatar: string | null;
};

export type ChatWithUsers = {
  id: number;

  user1Id: number;
  user2Id: number;

  createdAt: Date;
  updatedAt: Date;

  user1: UserPreview;
  user2: UserPreview;
};
