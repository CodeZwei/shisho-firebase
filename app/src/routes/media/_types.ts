import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import type { Media } from 'shared';

export type { Media };

export const mediaConverter: FirestoreDataConverter<Media> = {
  toFirestore(media: Media): DocumentData {
    return {
      pageUrl: media.pageUrl,
      createdAt: Timestamp.fromMillis(media.created_at),
      file_key: media.file_key,
      pending_delete: media.pending_delete,
      tags_all: media.tags_all,
      external: media.external,
      user: media.user,
      import: media.import,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Media {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      pageUrl: data.pageUrl,
      created_at: (data.createdAt as Timestamp).toMillis(),
      file_key: data.file_key ?? null,
      pending_delete: data.pending_delete ?? false,
      tags_all: data.tags_all ?? [],
      external: {
        imageUrl: data.external?.imageUrl ?? '',
        title: data.external?.title ?? '',
        tags_copyright: data.external?.tags_copyright ?? [],
        tags_character: data.external?.tags_character ?? [],
        tags_artist: data.external?.tags_artist ?? [],
        tags_general: data.external?.tags_general ?? [],
        tags_meta: data.external?.tags_meta ?? [],
      },
      user: {
        title: data.user?.title ?? null,
        notes: data.user?.notes ?? '',
        rating: data.user?.rating ?? 0,
        tags: data.user?.tags ?? [],
      },
      import: {
        last_imported_at: data.import?.last_imported_at ?? null,
        status: data.import?.status ?? 'unimported',
        parser: data.import?.parser ?? null,
        last_error: data.import?.last_error ?? null,
      },
    };
  },
};
