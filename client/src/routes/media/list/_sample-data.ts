import {Timestamp} from 'firebase/firestore';
import type {Media} from '../_types';


export const sampleMedia: Media[] = [
  {
    uid: '0001',
    created_at: Timestamp.now(),
    pageUrl: 'http://www.example.com/media/01',
    notes: '',
    pending_delete: false,
  },
  {
    uid: '0002',
    created_at: Timestamp.now(),
    pageUrl: 'http://www.example.com/media/02',
    notes: '',
    pending_delete: false,
  },
  {
    uid: '0003',
    created_at: Timestamp.now(),
    pageUrl: 'http://www.example.com/media/03',
    notes: '',
    pending_delete: false,
  },
  {
    uid: '0004',
    created_at: Timestamp.now(),
    pageUrl: 'http://www.example.com/media/04',
    notes: '',
    pending_delete: false,
  }
];
