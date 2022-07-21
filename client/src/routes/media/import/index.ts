import type {Media} from '../_types';
import type {RequestHandler} from './__types';
import {db} from '$lib/firebase';
import {collection, doc, Timestamp, writeBatch} from 'firebase/firestore';

export const post: RequestHandler = async ({request}) => {
  const form = await request.formData();

  const text = form.get('text');

  if (!text) return {status: 400};

  const lines = text.toString().split('\n');

  const items: Media[] = lines.map((line) => {
    const [url, ...rest] = line.split(' ');
    const notes = rest.join(' ');

    return {
      uid: '',
      pageUrl: url.trim(),
      notes,
      created_at: Timestamp.now(),
      pending_delete: false,
    };
  });

  // TODO: Actual request to firestore.
  console.log(items);
  const batch = writeBatch(db);
  const metadataCol = collection(db, 'media-metadata');
  items.map((media) => {
    batch.set(doc(metadataCol), {
      pageUrl: media.pageUrl,
      notes: media.notes,
      createdAt: media.created_at,
    });
  });

  return batch.commit()
      .then(() => {
        return {status: 200};
      })
      .catch((reason) => {
        return {status: 400, body: {error: reason}};
      });
};
