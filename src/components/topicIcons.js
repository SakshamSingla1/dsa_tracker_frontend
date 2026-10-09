import {
  FiCpu,
  FiGitBranch,
  FiGitMerge,
  FiGrid,
  FiHash,
  FiLayers,
  FiLink,
  FiList,
  FiRepeat,
  FiSearch,
  FiShare2,
  FiShuffle,
  FiSliders,
  FiTrendingUp,
  FiType,
} from "react-icons/fi";
import { GiTreeBranch, GiStack, GiMountainCave } from "react-icons/gi";

/** Best-effort icon for a topic name -- seed data names aren't a fixed enum, so this
 *  matches on keywords with a sensible fallback rather than requiring an exact map. */
const RULES = [
  [/math|basics/i, FiHash],
  [/sort/i, FiTrendingUp],
  [/binary search/i, FiSearch],
  [/string/i, FiType],
  [/linked list/i, FiLink],
  [/stack|queue/i, GiStack],
  [/recursion|backtrack/i, FiRepeat],
  [/bit/i, FiCpu],
  [/sliding window|two pointer/i, FiSliders],
  [/heap|priority/i, FiLayers],
  [/greedy/i, FiShuffle],
  [/tree/i, GiTreeBranch],
  [/graph/i, FiShare2],
  [/trie/i, FiGitBranch],
  [/dynamic programming|\bdp\b/i, FiGitMerge],
  [/pattern|rhombus|triangle|pyramid/i, GiMountainCave],
  [/array/i, FiGrid],
];

export default function topicIcon(name) {
  const match = RULES.find(([pattern]) => pattern.test(name));
  return match ? match[1] : FiList;
}
