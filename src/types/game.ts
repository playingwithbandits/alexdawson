export type CardCategory =
  | "wildcard"
  | "truth"
  | "dare"
  | "curse"
  | "battle"
  | "gamble"
  | "would-you-rather"
  | "never-have-i"
  | "challenge"
  | "paranoia"
  | "confession"
  | "debate"
  | "trivia"
  | "rule-maker"
  | "group-task";

export interface Card {
  description: string;
  penaltyCost: number;
  image?: string;
  category: CardCategory;
}
