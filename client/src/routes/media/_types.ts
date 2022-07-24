import type {DocumentData, FirestoreDataConverter, QueryDocumentSnapshot} from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

/** Type definition for Media Metadata */
export type Media = {
  id: string;
  // uid: string;  //
  created_at: number;
  pageUrl: string;
  notes: string;  //
  pending_delete: boolean;
};

export const mediaConverter: FirestoreDataConverter<Media> = {
  toFirestore(media: Media): DocumentData {
    return {
      pageUrl: media.pageUrl,
      notes: media.notes,
      createdAt: Timestamp.fromMillis(media.created_at),
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Media {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      // uid: snapshot.id,
      pageUrl: data.pageUrl,
      notes: data.notes,
      created_at: (data.createdAt as Timestamp).toMillis(),
      pending_delete: false,
    };
  }
};
