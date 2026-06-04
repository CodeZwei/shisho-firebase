import type { Media } from '../_types';

const blankExternal: Media['external'] = {
  imageUrl: '',
  title: '',
  tags: [],
};

const blankUser: Media['user'] = {
  title: null,
  notes: '',
  rating: 0,
  tags: [],
};

const blankImport: Media['import'] = {
  status: 'unimported',
  last_imported_at: null,
  parser: null,
  last_error: null,
};

export const sampleMedia: Media[] = [
  {
    id: '0001',
    created_at: Date.now(),
    pageUrl: 'http://www.example.com/media/01',
    file_key: null,
    pending_delete: false,
    tags_all: [],
    external: { ...blankExternal },
    user: { ...blankUser },
    import: { ...blankImport },
  },
  {
    id: '0002',
    created_at: Date.now(),
    pageUrl: 'http://www.example.com/media/02',
    file_key: null,
    pending_delete: false,
    tags_all: [],
    external: { ...blankExternal },
    user: { ...blankUser },
    import: { ...blankImport },
  },
  {
    id: '0003',
    created_at: Date.now(),
    pageUrl: 'http://www.example.com/media/03',
    file_key: null,
    pending_delete: false,
    tags_all: [],
    external: { ...blankExternal },
    user: { ...blankUser },
    import: { ...blankImport },
  },
  {
    id: '0004',
    created_at: Date.now(),
    pageUrl: 'http://www.example.com/media/04',
    file_key: null,
    pending_delete: false,
    tags_all: [],
    external: { ...blankExternal },
    user: { ...blankUser },
    import: { ...blankImport },
  },
];
