export interface Change {
    file: string;
    type: 'added' | 'modified' | 'deleted';
    diff: string;
    timestamp: Date;
}

export interface ChangeLog {
    summary: string;
    changes: {
        file: string;
        description: string;
        type: 'added' | 'modified' | 'deleted';
    }[];
    stats: {
        filesChanged: number;
        linesAdded: number;
        linesDeleted: number;
    };
    timestamp: Date;
}