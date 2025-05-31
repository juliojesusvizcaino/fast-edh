export class Player {
  id = $state(0);
  name = $state('');
  life = $state(40);
  rotation = $state<0 | 90 | 180 | 270>(0);
  gridArea = $state('');

  constructor(params: Partial<Player> = {}) {
    Object.assign(this, params);
  }
}

