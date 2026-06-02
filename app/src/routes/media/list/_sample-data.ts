import {Timestamp} from 'firebase/firestore';
import type {Media} from '../_types';


export const sampleMedia: Media[] = [
  {
    id: '0001',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/01',
    notes: '',
    pending_delete: false,
  },
  {
    id: '0002',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/02',
    notes: '',
    pending_delete: false,
  },
  {
    id: '0003',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/03',
    notes: '',
    pending_delete: false,
  },
  {
    id: '0004',
    created_at: Timestamp.now().toMillis(),
    pageUrl: 'http://www.example.com/media/04',
    notes: '',
    pending_delete: false,
  }
];
