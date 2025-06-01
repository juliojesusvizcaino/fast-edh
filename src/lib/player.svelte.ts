import { browser } from '$app/environment';

export class Player {
  id: number;
  #name: LocalStorageStore<string>;
  #life: LocalStorageStore<number>;
  rotation = $state<0 | 90 | 180 | 270>(0);
  gridArea = $state('');
  timer: Timer;

  constructor(params: { id: number, name: string, life: number, rotation: 0 | 90 | 180 | 270, gridArea: string, initialTime: number }) {
    this.id = params.id;
    this.#name = new LocalStorageStore(`name-${params.id}`, params.name);
    this.#life = new LocalStorageStore(`life-${params.id}`, params.life)
    this.rotation = params.rotation;
    this.gridArea = params.gridArea;
    this.timer = new Timer({ id: this.id, initialTime: params.initialTime })
  }

  get life() { return this.#life.value }
  set life(value: number) { this.#life.value = value }

  get name() { return this.#name.value }
  set name(value: string) { this.#name.value = value }
}

const DEFAULT_TIME_SECONDS = 15 * 60;


export class Timer {
  #isPaused: boolean;
  #timeSeconds: LocalStorageStore<number>;
  #interval: ReturnType<typeof setInterval> | undefined;
  #initialTime: number;
  #step: number;

  constructor(params: { id: number | string; initialTime?: number; step?: number }) {
    this.#initialTime = params.initialTime ?? DEFAULT_TIME_SECONDS;
    this.#step = params.step ?? -1;

    // --- State ---
    // Create reactive state using runes at the top level of the function.
    this.#timeSeconds = new LocalStorageStore(`timer-${params.id}`, this.#initialTime);
    this.#isPaused = $state(true);
    this.#interval = $state<ReturnType<typeof setInterval> | undefined>();
  }

  // --- Methods ---
  // These functions "close over" the state variables above.
  pause = () => {
    this.#isPaused = true;
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  };

  start = () => {
    if (!this.#isPaused) return;

    this.#isPaused = false;
    this.#interval = setInterval(() => {
      this.#timeSeconds.value = this.#timeSeconds.value + this.#step;
    }, 1000);
  };

  reset = () => {
    this.pause();
    this.#timeSeconds.value = this.#initialTime;
  };

  get timeSeconds() { return this.#timeSeconds.value; }
  get isPaused() { return this.#isPaused; }
  get formatted() {
    const isNegative = this.timeSeconds < 0;
    const absSeconds = Math.abs(this.timeSeconds);

    const minutes = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${isNegative ? '-' : ''}${formattedMinutes}:${formattedSecs}`;
  }
  get initialTimeSeconds() {
    return this.#initialTime;
  }
}

/**
 * Creates a reactive Svelte 5 signal that automatically persists its value
 * to localStorage and stays in sync across browser tabs.
 *
 * This version returns the signal directly.
 *
 * @param key The key to use for storing the value in localStorage.
 * @param initialValue The initial value to use if no value is found.
 * @returns A reactive Svelte 5 signal.
 */
export class LocalStorageStore<T> {
  value: T;

  constructor(key: string, initialValue: T) {
    const getStoredValue = () => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as T;
        } catch {
          // Fallback to initial if JSON is malformed
          return initialValue;
        }
      }
      return initialValue;
    };

    // Determine the initial state: use localStorage value on browser, otherwise default.
    const initial = browser ? getStoredValue() : initialValue;

    // Create the reactive signal.
    this.value = $state(initial);

    // The effect runs on the client to sync the state with localStorage.
    $effect(() => {
      if (browser) {
        // Update localStorage when state changes.
        localStorage.setItem(key, JSON.stringify(this.value));

        // Listen for changes from other tabs.
        // const handleStorage = (event: StorageEvent) => {
        //   if (event.key === key && event.newValue) {
        //     try {
        //       this.value = JSON.parse(event.newValue);
        //     } catch {
        //       /* ignore */
        //     }
        //   }
        // };

        // window.addEventListener('storage', handleStorage);

        // The effect's cleanup function: remove the event listener.
        // This runs when the component is unmounted.
        return () => {
          // window.removeEventListener('storage', handleStorage);
        };
      }
    });
  }
}
