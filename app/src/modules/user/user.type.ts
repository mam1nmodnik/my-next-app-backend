
export type User = {
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