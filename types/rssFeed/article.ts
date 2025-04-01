export interface Article {
    id?: number;        // Add ID property
    feedId: number;     // Add feedId property
    authors: Author[];
    categories: Category[];
    content?: string;
    description?: string;
    image?: Image;
    published?: Date;
    title?: string;
    updated?: Date;
    url: string;
    unread: boolean;
    safedForLater: boolean;
}
export interface Author {
    name: string;
    email: string;
    link: string;
}

export interface Category {
    label: string;
    term: string;
    url: string;
}

export interface Image {
    url: string;
    title: string;
}

export interface TextSettings {
    fontSize: number;
    fontFamily: string;
}
