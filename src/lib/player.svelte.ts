import { browser } from '$app/environment';

export class Player {
  id: number;
  name = $state('');
  #life: LocalStorageStore<number>;
  rotation = $state<0 | 90 | 180 | 270>(0);
  gridArea = $state('');
  timer: Timer;

  constructor(params: { id: number, name: string, life: number, rotation: 0 | 90 | 180 | 270, gridArea: string, initialTime: number }) {
    this.id = params.id;
    this.name = params.name;
    this.#life = new LocalStorageStore(`life-${params.id}`, params.life)
    this.rotation = params.rotation;
    this.gridArea = params.gridArea;
    this.timer = new Timer({ id: this.id, initialTime: params.initialTime })
  }

  get life() {
    return this.#life.value;
  }

  set life(value: number) {
    this.#life.value = value;
  }
}

const DEFAULT_TIME_SECONDS = 15 * 60;


export class Timer {
  #isPaused: boolean;
  #timeSeconds: LocalStorageStore<number>;
  #interval: ReturnType<typeof setInterval> | undefined;
  #initialTime: number;

  constructor(params: { id: number; initialTime?: number }) {
    this.#initialTime = params.initialTime ?? DEFAULT_TIME_SECONDS;

    // --- State ---
    // Create reactive state using runes at the top level of the function.
    this.#timeSeconds = new LocalStorageStore(`countdown-${params.id}`, this.#initialTime);
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
      if (this.#timeSeconds.value > 0) {
        this.#timeSeconds.value--; // This works because `timeSeconds` is a signal
      } else {
        this.pause();
      }
    }, 1000);
  };

  reset = () => {
    this.pause();
    this.#timeSeconds.value = this.#initialTime;
  };

  get timeSeconds() { return this.#timeSeconds.value; }
  get isPaused() { return this.#isPaused; }
  get formatted() {
    const minutes = Math.floor(this.timeSeconds / 60);
    const secs = this.timeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
    console.log('building local storage', key, initialValue)
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
        const handleStorage = (event: StorageEvent) => {
          if (event.key === key && event.newValue) {
            try {
              this.value = JSON.parse(event.newValue);
            } catch {
              /* ignore */
            }
          }
        };

        window.addEventListener('storage', handleStorage);

        // The effect's cleanup function: remove the event listener.
        // This runs when the component is unmounted.
        return () => {
          window.removeEventListener('storage', handleStorage);
        };
      }
    });
  }
}
