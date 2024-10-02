export const INIT_SELECTOR_STATE = { value: '', name: '' };

export const LAUNCHPAD_RANKING_ITEMS = [
  {
    id: 0,
    name: '100+ AIX<br />Holders',
    period: 'No bonuses',
    bgSRC: '/images/launchpad/ranking-1-bg.png',
  },
  {
    id: 1,
    name: '10K+ AIX<br />Holders',
    period: '+ 10% bonus $ECL tokens allocation',
    bgSRC: '/images/launchpad/ranking-2-bg.png',
    params: [
      {
        name: 'Method',
        value: 'FCFS',
      },
      {
        name: 'Min. Sum to Stake',
        value: '500 $AIX',
      },
      {
        name: 'Max Individual Alloc',
        value: '$500',
      },
      {
        name: 'Exclusive Pools',
        value: 'enabled',
      },
    ],
  },
  {
    id: 2,
    name: '100K+ AIX<br />Holders',
    period: '+ 20% bonus $ECL tokens allocation',
    bgSRC: '/images/launchpad/ranking-3-bg.png',
    params: [
      {
        name: 'Method',
        value: 'FCFS',
      },
      {
        name: 'Min. Sum to Stake',
        value: '1000 $AIX',
      },
      {
        name: 'Max Individual Alloc',
        value: '$2000',
      },
      {
        name: 'Exclusive Pools',
        value: 'enabled',
      },
    ],
  },
];
