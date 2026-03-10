
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ContentBlock {
    id: string;
    type: "video" | "reading" | "quiz" | "task" | "file_task";
    title: string;
    order: number;
    duration?: string;
    content_url?: string;
    url?: string; 
    body_text?: string;
    quiz_data?: any;
}

export interface Module {
    id: string;
    title: string;
    description?: string;
    order: number;
    blocks: ContentBlock[];
}

export interface CourseDetail {
    id: string;
    title: string;
    subtitle?: string;
    description?: string; 
    short_description?: string;
    long_description?: string;

    category: string;
    subcategory?: string; 
    topic?: string;
    subtopic?: string;

    instructor: {
        name: string; 
        specialty?: string;
        bio?: string;
        image?: string;
        country?: string;
    };

    level?: string;
    duration?: string; 
    modality?: string; 
    price?: number; 

    learning_goals?: string[]; 
    target_audience?: string[];

    modules: Module[];

    is_protected?: boolean;
    requires_professional_profile?: boolean;
    requirements?: string;

    [key: string]: any;
}

export const courseService = {
    getCourseById: async (id: string): Promise<CourseDetail> => {
        try {
            const response = await fetch(`${API_URL}/courses/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch course');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching course:', error);
            throw error; 
        }
    }
};
