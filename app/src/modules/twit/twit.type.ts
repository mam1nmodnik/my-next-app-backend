export interface TwitCreate {
    userId: string;
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
    id: number;
    content: string;
    createdAt: Date;
    likesCount: number;
    isLiked: boolean;
    
    userId: number;

    user: {
        id: number;
        name: string | null;
        login: string;
        avatar: string | null;
    };

    likes: Likes[]
}
