import {sampleMedia} from './_sample-data';
import type {RequestHandler} from './__types';

export const get: RequestHandler = async () => {
  // For now, hardcoded sample data
  return {status: 200, body: {mediaList: sampleMedia}};
};

// If the user has JavaScript disabled, the URL will change to
// include the method override unless we redirect back to /media/list
const redirect = {
  status: 303,
  headers: {
    location: '/media/list',
  }
};

export const del: RequestHandler = async ({request}) => {
  const form = await request.formData();

  form.get('uil');

  // TODO Issue a delete request
  // await api('DELETE', `todos/${locals.userid}/${form.get('uid')}`);

  return redirect;
};
