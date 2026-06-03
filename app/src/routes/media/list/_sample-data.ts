import {Timestamp} from 'firebase/firestore';
import type {Media} from '../_types';

const blankFields = {
  imageUrl: '',
  title: '',
  tags_copyright: [],
  tags_character: [],
  tags_artist: [],
  tags_general: [],
  tags_meta: [],
  tags: [],
  rating: 0,
  file_key: null,
};

export const sampleMedia: Media[] = [
  {
    ...blankFields,
    id: '0001',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/01',
    notes: '',
    pending_delete: false,
  },
  {
    ...blankFields,
    id: '0002',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/02',
    notes: '',
    pending_delete: false,
  },
  {
    ...blankFields,
    id: '0003',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/03',
    notes: '',
    pending_delete: false,
  },
  {
    ...blankFields,
    id: '0004',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/04',
    notes: '',
    pending_delete: false,
  }
];
