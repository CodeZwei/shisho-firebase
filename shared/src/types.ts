export type Media = {
  id: string;
  pageUrl: string;
  imageUrl: string;
  title: string;
  notes: string;
  tags_copyright: string[];
  tags_character: string[];
  tags_artist: string[];
  tags_general: string[];
  tags_meta: string[];
  tags: string[];
  rating: number;
  created_at: number;
  file_key: string | null;
  pending_delete: boolean;
};
