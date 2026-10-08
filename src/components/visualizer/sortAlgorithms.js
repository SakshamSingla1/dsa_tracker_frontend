// Each algorithm runs to completion up front against a *copy* of the input, recording one
// "step" per comparison/swap/merge-write. Playback then just walks this list on a timer --
// much simpler than coordinating real async delays with pause/step-back/speed changes.

function snapshot(array) {
  return [...array];
}

export function bubbleSortSteps(input) {
  const a = snapshot(input);
  const steps = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ type: "compare", indices: [j, j + 1], array: snapshot(a) });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ type: "swap", indices: [j, j + 1], array: snapshot(a) });
      }
    }
  }
  steps.push({ type: "done", indices: [], array: snapshot(a) });
  return steps;
}

export function selectionSortSteps(input) {
  const a = snapshot(input);
  const steps = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ type: "compare", indices: [minIdx, j], array: snapshot(a) });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({ type: "swap", indices: [i, minIdx], array: snapshot(a) });
    }
  }
  steps.push({ type: "done", indices: [], array: snapshot(a) });
  return steps;
}

export function insertionSortSteps(input) {
  const a = snapshot(input);
  const steps = [];
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      steps.push({ type: "compare", indices: [j, j + 1], array: snapshot(a) });
      a[j + 1] = a[j];
      j--;
      steps.push({ type: "swap", indices: [j + 1, j + 2], array: snapshot(a) });
    }
    a[j + 1] = key;
  }
  steps.push({ type: "done", indices: [], array: snapshot(a) });
  return steps;
}

export function mergeSortSteps(input) {
  const a = snapshot(input);
  const steps = [];

  function merge(lo, mid, hi) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      steps.push({ type: "compare", indices: [lo + i, mid + 1 + j], array: snapshot(a) });
      if (left[i] <= right[j]) {
        a[k] = left[i++];
      } else {
        a[k] = right[j++];
      }
      steps.push({ type: "swap", indices: [k], array: snapshot(a) });
      k++;
    }
    while (i < left.length) {
      a[k] = left[i++];
      steps.push({ type: "swap", indices: [k], array: snapshot(a) });
      k++;
    }
    while (j < right.length) {
      a[k] = right[j++];
      steps.push({ type: "swap", indices: [k], array: snapshot(a) });
      k++;
    }
  }

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  sort(0, a.length - 1);
  steps.push({ type: "done", indices: [], array: snapshot(a) });
  return steps;
}

export function quickSortSteps(input) {
  const a = snapshot(input);
  const steps = [];

  function partition(lo, hi) {
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({ type: "compare", indices: [j, hi], array: snapshot(a) });
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ type: "swap", indices: [i, j], array: snapshot(a) });
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    steps.push({ type: "swap", indices: [i + 1, hi], array: snapshot(a) });
    return i + 1;
  }

  function sort(lo, hi) {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  }

  sort(0, a.length - 1);
  steps.push({ type: "done", indices: [], array: snapshot(a) });
  return steps;
}

export const ALGORITHMS = {
  BUBBLE: {
    label: "Bubble Sort",
    run: bubbleSortSteps,
    time: "O(n²)",
    space: "O(1)",
    blurb: "Repeatedly swaps adjacent out-of-order elements, bubbling the largest value to the end each pass.",
  },
  SELECTION: {
    label: "Selection Sort",
    run: selectionSortSteps,
    time: "O(n²)",
    space: "O(1)",
    blurb: "Finds the minimum of the unsorted remainder and swaps it into place, one position at a time.",
  },
  INSERTION: {
    label: "Insertion Sort",
    run: insertionSortSteps,
    time: "O(n²)",
    space: "O(1)",
    blurb: "Builds the sorted array one element at a time, shifting larger elements right to make room.",
  },
  MERGE: {
    label: "Merge Sort",
    run: mergeSortSteps,
    time: "O(n log n)",
    space: "O(n)",
    blurb: "Splits the array in half recursively, then merges the sorted halves back together.",
  },
  QUICK: {
    label: "Quick Sort",
    run: quickSortSteps,
    time: "O(n log n) avg, O(n²) worst",
    space: "O(log n)",
    blurb: "Picks a pivot, partitions smaller/larger elements around it, then recurses on each side.",
  },
};

export const ALGORITHM_ORDER = ["BUBBLE", "SELECTION", "INSERTION", "MERGE", "QUICK"];
