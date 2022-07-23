import type {DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, Timestamp} from 'firebase/firestore';

/** Type definition for Media Metadata */
export type Media = {
  id: string;
  // uid: string;  //
  created_at: Timestamp;
  pageUrl: string;
  notes: string;  //
  pending_delete: boolean;
};

export const mediaConverter: FirestoreDataConverter<Media> = {
  toFirestore(media: Media): DocumentData {
    return {
      pageUrl: media.pageUrl,
      notes: media.notes,
      createdAt: media.created_at,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot, options): Media {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      // uid: snapshot.id,
      pageUrl: data.pageUrl,
      notes: data.notes,
      created_at: data.createdAt,
      pending_delete: false,
    };
  }
};
