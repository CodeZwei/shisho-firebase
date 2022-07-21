import type {RequestHandler} from './__types';
import {db} from '$lib/firebase';
import {collection, deleteDoc, doc, getDocs, limit, query} from 'firebase/firestore';
import {mediaConverter, type Media} from '../_types';

export const get: RequestHandler = async () => {
  const metadataCol =
      collection(db, 'media-metadata').withConverter(mediaConverter);
  const q = query(metadataCol, limit(50));

  const snapshot = await getDocs(q);
  const mediaList: Media[] = [];
  snapshot.forEach((doc) => mediaList.push(doc.data()));

  return {status: 200, body: {mediaList}};
};

export const del: RequestHandler = async ({request}) => {
  const form = await request.formData();

  const uid = form.get('uid');

  const ref = doc(db, 'media-metadata/' + uid);

  return deleteDoc(ref)
      .then(() => {
        return {status: 200};
      })
      .catch((reason) => {
        return {status: 400, body: {error: reason}};
      });
};
