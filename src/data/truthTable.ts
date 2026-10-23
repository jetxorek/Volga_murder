import type { TruthTable } from '../schemas/truthTable';

export const CULPRITS: string[] = ['char_02', 'char_03'];

export const TRUTH_TABLE: TruthTable = {
  char_02: {
    motive: { inherits_after_death: 'true', marriage_for_money: 'true' },
    opportunity: { was_husband_with_access: 'true' },
    alibi: { slept_in_cabin: 'false', was_at_linnets_cabin: 'true' },
    psychology: {
      rubs_back_of_head_when_lying: 'true',
      claims_loved_linnet: 'false',
      exaggerates_wound: 'true',
    },
    contradiction: {
      alibi_contradicted_by_louise: 'true',
      alibi_contradicted_by_brenner: 'true',
    },
  },
  char_03: {
    motive: { loves_simon: 'true', jealous_of_linnet: 'true' },
    opportunity: {
      left_cabin_at_night: 'true',
      was_near_linnets_cabin: 'true',
    },
    alibi: { in_cabin_all_night: 'false', visited_simons_cabin: 'true' },
    psychology: { cold_under_pressure: 'true', claims_over_simon: 'false' },
    contradiction: {
      alibi_contradicted_by_otterborn: 'true',
      alibi_contradicted_by_evidence: 'true',
    },
  },
  char_05: {
    opportunity: { saw_simon_at_cabin: 'true', initially_denied_seeing: 'false' },
    psychology: {
      afraid_of_simon: 'true',
      knew_too_much: 'true',
    },
    contradiction: { initial_denial_was_lie: 'true' },
  },
  char_06: {
    motive: { embezzled_money: 'true', fears_exposure: 'plausible' },
    alibi: { reading_in_cabin: 'true' },
    psychology: { denies_embezzlement: 'false' },
  },
  char_08: {
    motive: { has_debts: 'true' },
    opportunity: { access_to_pearls: 'true' },
    alibi: { on_deck_smoking: 'false', was_near_pearls: 'true' },
    psychology: { claims_no_interest_in_money: 'false', financially_desperate: 'true' },
    contradiction: { theft_denial_contradicted: 'true' },
  },
  char_09: {
    motive: { kleptomania: 'true' },
    alibi: { praying_in_cabin: 'true' },
    psychology: { claims_honest: 'false', kleptomaniac_behaviors: 'true' },
    contradiction: { kleptomania_denial_contradicted: 'true' },
  },
  char_10: {
    opportunity: { saw_jeanne_leaving: 'plausible' },
    alibi: { sleeping_in_cabin: 'false', heard_shot_and_responded: 'true' },
    psychology: { professional_distance: 'true' },
  },
  char_07: {
    opportunity: { saw_jeanne_leaving: 'true' },
    psychology: {
      writes_everything_down: 'true',
      fearless: 'true',
      knew_killer: 'true',
    },
  },
  char_04: {
    psychology: { proud_and_dismissive: 'true', underestimated_jeanne: 'true' },
  },
  group: {
    motive: { love_triangle: 'true', conspiracy_between_simon_and_jeanne: 'true' },
  },
} satisfies TruthTable;
