import {db} from '$lib/firebase/server';
import {mediaConverter, type Media} from '../_types';
import {browser} from '$app/environment';

export async function load({locals}) {
  const uid = locals.auth?.uid;
  console.log('Request has uid: ' + uid);

  if (!uid) return {status: 403};

  console.log('media/list GET running browser=' + browser);
  const metadataCol = db.collection('media-metadata').limit(50).withConverter(mediaConverter);
  const q = metadataCol.get();

  const snapshot = await q;
  const mediaList: Media[] = [];
  snapshot.forEach((doc) => mediaList.push(doc.data()));

  return {mediaList};
};

export const actions = {
  delete: async ({request}) => {
      const form = await request.formData();
    
      const uid = form.get('uid');
    
      const ref = db.doc('media-metadata/' + uid);
    
      return ref.delete()
          .then(() => {
            return {status: 200};
          })
          .catch((reason) => {
            return {status: 400, body: {error: reason}};
          });
    },
};