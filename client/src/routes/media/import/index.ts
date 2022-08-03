import type {Media} from '../_types';
import type {RequestHandler} from './__types';
import {db} from '$lib/firebase/server';
import type {WriteBatch} from 'firebase-admin/firestore';
import {Timestamp} from 'firebase-admin/firestore';

/** Predicate which returns true iff given element is truthy. */
function nonEmptyString(element: string): boolean {
  return !!element;
}

export const post: RequestHandler = async ({request}) => {
  const form = await request.formData();

  const text = form.get('text');

  if (!text) return {status: 400};

  // A bit hacky, splits the URL from the notes and filters out empty or non-url
  // lines
  const lines = text.toString()
                    .split('\n')
                    .map(s => s.trim())
                    .filter(nonEmptyString)
                    .filter(s => s.startsWith('http'));

  const items: Media[] = lines.map((line) => {
    const [url, ...rest] = line.split(' ');
    const notes = rest.join(' ');

    return {
      id: '',
      pageUrl: url.trim(),
      notes,
      created_at: Timestamp.now().toMillis(),
      pending_delete: false,
    };
  });

  const batches: WriteBatch[] = [];

  const chunkSize = 400;  // less then the 500 max firestore batch size
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    // Write batch updates to Firestore
    const batch = db.batch();
    const metadataCol = db.collection('media-metadata');
    chunk.map((media) => {
      batch.set(metadataCol.doc(), {
        pageUrl: media.pageUrl,
        notes: media.notes,
        createdAt: media.created_at,
      });
    });

    batches.push(batch);
  }

  return Promise.all(batches.map(b => b.commit()))
      .then(() => {
        return {status: 200};
      })
      .catch((reason) => {
        return {status: 400, body: {error: reason}};
      });
};
