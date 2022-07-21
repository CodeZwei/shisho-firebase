import type {Timestamp} from 'firebase/firestore';

/** Type definition for Media Metadata */
export type Media = {
  uid: string;  //
  created_at: Timestamp;
  pageUrl: string;
  notes?: string;  //
  pending_delete: boolean;
};
