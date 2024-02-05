CREATE index idx_event_date on Events (date);
CREATE index idx_event_format on Events (format);
CREATE index idx_event_kind on Events (kind);

CREATE index idx_standing_event_id on Standings (event_id);
CREATE index idx_standing_player on Standings (player);
CREATE index idx_standing_opponent on Standings (opponent);

CREATE index idx_match_event_id on Matches (event_id);
CREATE index idx_match_player on Matches (player);
CREATE index idx_match_opponent on Matches (opponent);

CREATE index idx_deck_event_id on Decks (event_id);
CREATE index idx_deck_player on Decks (player);

CREATE UNIQUE index idx_archetype_deck_id ON Archetypes (deck_id);
CREATE index idx_archetype_archetype ON Archetypes (archetype);
CREATE index idx_archetype_archetype_id ON Archetypes (archetype_id);
