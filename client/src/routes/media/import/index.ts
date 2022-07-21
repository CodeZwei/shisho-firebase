import type {Media} from '../_types';
import type {RequestHandler} from './__types';

export const post: RequestHandler = async ({request}) => {
  const form = await request.formData();

  const text = form.get('text');

  if (!text) return {status: 400};

  const lines = text.toString().split('\n');
  const items: Media[] = lines.map((line) => {
    const [url, ...rest] = line.split(' ');
    const notes = rest.join(' ');

    // TODO: https://stackoverflow.com/a/59300579
    // Use firebase.firestore.Timestamp.now()
    return {
      uid: crypto.randomUUID(),                   //
          pageUrl: url,                           //
          notes,                                  //
          created_at: new Date().toDateString(),  //
          pending_delete: false,                  //
    }
  });

  // TODO: Actual request to firestore.
  console.log(items);

  return {status: 200};
};
