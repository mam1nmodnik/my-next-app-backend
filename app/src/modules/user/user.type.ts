
export type UserSession = {
    id: number;
    email: string;
    login: string;
    name: string | null;
    avatar: string | null;
    avatarPublicId: string | null;
    date: Date | null;
    bio: string | null;
    _count: {
        following: number;
        followers: number;
    };
};

export type UserRecommended = {
    id: number;
    login: string;
    name: string | null;
    avatar: string | null;
    isFollowedByMe: boolean;
}

export type User = {
    id: number;
    login: string;
    name: string | null;
    email: string;
    avatar: string | null;
    bio: string | null;
    avatarPublicId: string | null;
    _count: {
        followers: number;
        following: number;
    };
    isFollowedByMe: boolean;
}