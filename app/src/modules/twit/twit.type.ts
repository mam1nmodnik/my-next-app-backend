export interface TwitCreate {
    userId: number;
    content: string;
}
// userSession
export interface UserId {
    id: string;
}
// Post 
interface Likes {
    id: number;
}
export interface Twit {
    likesCount: number;
    isLiked: boolean;
    user: {
        id: number;
        login: string;
        name: string | null;
        avatar: string | null;
    };
    likes: {
        id: number;
    }[];
    id: number;
    userId: number;
    content: string;
    createdAt: Date;
}

export interface TwitLikeResult {
    post: {
        id: number;
        userId: number;
        content: string;
        likesCount: number;
        createdAt: Date;
    };
    liked: boolean;
}
