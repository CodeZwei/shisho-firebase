export type Media = {
  id: string;
  pageUrl: string;
  created_at: number;
  file_key: string | null;
  pending_delete: boolean;
  tags_all: string[];

  external: {
    imageUrl: string;
    title: string;
    tags_copyright: string[];
    tags_character: string[];
    tags_artist: string[];
    tags_general: string[];
    tags_meta: string[];
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
