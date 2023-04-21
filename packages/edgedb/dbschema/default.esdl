module default {
}

module Kinoko {
  
}

# Maps the `Result` and `Event` tables to a predictable schema.
module tournaments {
  type Event {
    annotation title := 'Event';
    annotation description := 'An event entry mapping to each unique event.';
    # Required properties
    required property id -> int16 { constraint exclusive };
    required property format -> str;
    required property kind -> str;
    required property date -> datetime;
    required property posted -> datetime;
    required property url := std::array_join([
      .format,
      .kind,
      std::to_datetime(.posted, 'Mon DDth, YYYY')
    ], '-');
    required property results := .<event[is Result];
    # Schema indexes
    index on ((.format, .kind)) {
      annotation description := 'Index of events by format and kind fields.';
    };
  }
  type Result {
    annotation title := 'Result';
    annotation description := 'A result entry mapping to each unique player in an event.'
    # Required properties
    required property username -> str;
    required link event -> Event;
    required property url -> str { constraint exclusive };
    required property deck;
    # Optional properties
    property stats -> ;
    multi link archetype -> Archetype { constraint exclusive };
    # Schema indexes
    index on ((.event, .username)) {
      annotation description := 'Indexing all results by event -> username hierarchy.'
    };
    index on ((.archetype, .deck)) {
      annotation description := 'Indexing all results by archetype -> deck hierarchy.'
    };
  }
}

module collections {
  type Card {
    annotation title := 'Card Entry.';
    annotation description := 'A card entry mapping to each unique card.';
    # Required properties
    required property uid -> { constraint exclusive };
    required property name -> str { constraint exclusive };
    required property colors -> array<str> {
      default := ['C'];
    };
    required property color_identity array<str> {
      default := ['C'];
    };
    required property cmc -> int16 {
      default := 0;
      constraint min_value(0);
    };
    required property mana_cost -> str {
      default := "";
    };
    required property layout -> str {
      default := "normal";
    };
    required property scryfall_id -> uuid { constraint exclusive };
    required property printings -> json<array<str>>;
    required property legalities -> json;
    # Optional properties
    property produced_mana array<str>;
    property power int16 {
      default := 0;
      constraint min_value(0);
    };
    property toughness int16 {
      default := 0;
      constraint min_value(0);
    };
    property loyalty int16 {
      default := 0;
      constraint min_value(0);
    };
    property supertypes array<str>;
    property types array<str>;
    property subtypes array<str>;
    property oracle_text str|array<str>;
    property keywords array<str>;
    property tagger -> array<str>;
    # Schema indexes
    index on (.name) {
      annotation description := 'Indexing all cards by name.'
    };
  }
  type Archetype {
    annotation title := 'Archetype Entry';
    annotation description := 'An archetype entry mapping to a unique archetype class.';
    # Required properties
    required property signature -> uuid;
    # Optional propertes
    property displayName -> str;
  }
}