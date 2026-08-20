import { Sermon } from '@/types';

export const sermons: Sermon[] = [
  {
    id: 'srm-001',
    title: 'Walking in the Light',
    preacher: 'The Rt. Rev. (Dr.) Bishop of Oke-Osun',
    date: '2026-08-09',
    scripture: '1 John 1:5-7',
    description: 'A call to holiness and honest fellowship as children of light.',
    youtubeId: '', // TODO: was left as a Rick Astley placeholder ID — replace with the real YouTube video ID for this sermon
    image: '/images/bishop.png',
  },
  {
    id: 'srm-002',
    title: 'The Faithfulness of God',
    preacher: 'Ven. Samuel Adeyemi',
    date: '2026-08-02',
    scripture: 'Lamentations 3:22-23',
    description: 'Reflecting on God\'s unfailing mercy in every season of life.',
    audioUrl: '/audio/faithfulness-of-god.mp3',
  },
  {
    id: 'srm-003',
    title: 'Living Sacrifice',
    preacher: 'Rev. Canon Elizabeth Fadipe',
    date: '2026-07-26',
    scripture: 'Romans 12:1-2',
    description: 'What it means to offer our whole lives in worship to God.',
    audioUrl: '/audio/living-sacrifice.mp3',
  },
];
