export type Media = {
  uid: string; created_at: Date; pageUrl: string; pending_delete: boolean;
};

export const sampleMedia: Media[] = [
  {
    uid: '0001',
    created_at: new Date(),
    pageUrl: 'http://www.example.com/media/01',
    pending_delete: false,
  },
  {
    uid: '0002',
    created_at: new Date(),
    pageUrl: 'http://www.example.com/media/02',
    pending_delete: false,
  },
  {
    uid: '0003',
    created_at: new Date(),
    pageUrl: 'http://www.example.com/media/03',
    pending_delete: false,
  },
  {
    uid: '0004',
    created_at: new Date(),
    pageUrl: 'http://www.example.com/media/04',
    pending_delete: false,
  }
];
