export interface Article {
    authors: Author[];
    categories: Category[];
    content?: string;
    description?: string;
    image?: Image;
    published?: Date;
    title?: string;
    updated?: Date;
    url: string;
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
