import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import type { Media } from 'shared';

export type { Media };

export const mediaConverter: FirestoreDataConverter<Media> = {
  toFirestore(media: Media): DocumentData {
    return {
      pageUrl: media.pageUrl,
      imageUrl: media.imageUrl,
      title: media.title,
      notes: media.notes,
      tags_copyright: media.tags_copyright,
      tags_character: media.tags_character,
      tags_artist: media.tags_artist,
      tags_general: media.tags_general,
      tags_meta: media.tags_meta,
      tags: media.tags,
      rating: media.rating,
      file_key: media.file_key,
      pending_delete: media.pending_delete,
      createdAt: Timestamp.fromMillis(media.created_at),
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Media {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      pageUrl: data.pageUrl,
      imageUrl: data.imageUrl ?? '',
      title: data.title ?? '',
      notes: data.notes ?? '',
      tags_copyright: data.tags_copyright ?? [],
      tags_character: data.tags_character ?? [],
      tags_artist: data.tags_artist ?? [],
      tags_general: data.tags_general ?? [],
      tags_meta: data.tags_meta ?? [],
      tags: data.tags ?? [],
      rating: data.rating ?? 0,
      created_at: (data.createdAt as Timestamp).toMillis(),
      file_key: data.file_key ?? null,
      pending_delete: data.pending_delete ?? false,
    };
  },
};
