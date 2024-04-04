CREATE index idx_event_date on Events (date);
CREATE index idx_event_format on Events (format);
CREATE index idx_event_kind on Events (kind);

CREATE index idx_standing_player on Standings (event_id, player);

CREATE index idx_match_player on Matches (event_id, player);
CREATE index idx_match_opponent on Matches (event_id, opponent);

CREATE index idx_deck_player on Decks (event_id, player);

-- CREATE UNIQUE index idx_archetype_deck_id ON Archetypes (deck_id);
-- CREATE index idx_archetype_archetype ON Archetypes (archetype);
-- CREATE index idx_archetype_archetype_id ON Archetypes (archetype_id);
DROP index idx_archetype_deck_id;
DROP index idx_archetype_archetype;
DROP index idx_archetype_archetype_id;

-- CREATE UNIQUE index idx_archetype_id ON Archetypes (id, archetype_id);