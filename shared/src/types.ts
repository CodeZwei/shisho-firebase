export type Media = {
  id: string;
  pageUrl: string;
  created_at: number;
  file_key: string | null;
  pending_delete: boolean;
  tags_all: string[];

  external: {
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    title: string;
    tags: string[];
  };

  user: {
    title: string | null;
    notes: string;
    rating: number;
    tags: string[];
  };

  import: {
    last_imported_at: number | null;
    status: 'unimported' | 'success' | 'failed';
    parser: string | null;
    last_error: string | null;
  };
};
