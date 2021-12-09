import fetch from 'node-fetch';

import { sql, dynamicSortMultiple, pruneObjectKeys, calculateEventStats } from '@packages/database';
import { MTGO } from '@packages/magic';
import { getParams, getQueryArgs, groupQuery, eventsQuery } from '@packages/querybuilder';

const Metagame = async (req, res) => {
  // Parse and pre-validate 'uids' parameter
  const _uids = getParams(req.query, 'id', 'uid', 'uids', 'event', 'event_id', 'eventID');
  const uids = _uids
    .map(id => [...id.split(',')].map(_id => _id.match(/[0-9]+/g).join('')) || null)
    .flat(1)
    .filter(Boolean);
  if (_uids.length && !uids?.length) {
    return res.status(400).json({
      details: `No valid 'eventID' ${
        uids?.length == 1 ? 'parameter' : 'parameters'
      } provided.`,
    });
  }
  // Group query parameters by named params and aliases.
  const queryParams = groupQuery({
    query: getQueryArgs(req?.query).flat(1),
    _mainParam: ['card', 'name', 'cardname'],
    _param1: ['qty', 'quantity'],
    _param2: ['is', 'c', 'cont', 'container'],
  });
  // Match query against params and extract query logic.
  const _query = [...new Set(queryParams.map(obj => obj.group))]
    .map(group => queryParams.filter(obj => obj.group == group))
    .flat(1);
  if (_query?.length == 1 && _query[0]?.value === 0) {
    return res.status(400).json({ details: "You didn't enter anything to search for." });
  }

  // Remove unmatched cards from query conditions.
  let ignoredGroups = [];
  let query = await Promise.all(
    _query
      .map(async obj => {
        if (obj.parameter == 'cardname') {
          const request = await fetch(
            `https://api.scryfall.com/cards/named?fuzzy=${obj.value}`
          ).then(response => response.json());
          if (!request?.name) ignoredGroups.push(obj.group);
          return { ...obj, value: request?.name || null };
        }
        if (obj.parameter == 'quantity') {
          if (isNaN(obj.value)) {
            ignoredGroups.push(obj.group);
            return { ...obj, value: null };
          }
        }
        if (obj.parameter == 'container') {
          if (!['mainboard', 'sideboard'].includes(obj.value)) {
            ignoredGroups.push(obj.group);
            return { ...obj, value: null };
          }
        }
        return obj;
      })
      .filter(Boolean)
  );

  // Create warnings for invalid parameters.
  let warnings = ignoredGroups.length
    ? {
        errors: [
          // Query errors
          ...[...new Set(query.map(obj => obj.group))]
            .filter(Boolean)
            .filter(group => ignoredGroups.includes(group))
            .map(group => {
              const getValue = parameter =>
                _query
                  .filter(obj => obj.group == group)
                  .filter(obj => obj.parameter == parameter)
                  .map(obj => obj.value)[0];
              const errors = query
                .filter(obj => obj.group == group)
                .filter(obj => obj.value === null)
                .map(obj => obj.parameter);
              const condition = _query
                .filter(obj => obj.group == group)
                .map(_obj =>
                  [
                    _obj.parameter.toLowerCase(),
                    _obj.operator,
                    !isNaN(_obj.value) ? _obj.value : `'${_obj.value || ''}'`,
                  ].join(' ')
                )
                .join(' and ');
              return [
                'T' +
                  [
                    errors.includes('cardname')
                      ? `the card '${getValue('cardname')}' could not be found`
                      : '',
                    errors.includes('quantity')
                      ? `the quantity '${getValue('quantity')}' is not a number`
                      : '',
                    errors.includes('container')
                      ? `the container '${getValue('container')}' does not exist`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(', ')
                    .replace(/, ([^,]*)$/, ' and $1')
                    .slice(1) +
                  '.',
                `Condition ${group} “${condition}” was ignored.`,
              ]
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            })
            .flat(1),
        ],
      }
    : {};

  // Query warnings
  warnings.warnings = [
    // ...(warnings?.warnings || []),
    ...[
      ...new Set(
        query
          .filter(obj => obj.parameter == 'quantity' && obj.value <= 0)
          .map(obj => obj.group)
      ),
    ]
      .map(group => {
        const getValue = parameter =>
          _query
            .filter(obj => obj.group == group)
            .filter(obj => obj.parameter == parameter)
            .map(obj => obj.value)[0];
        return [
          `Condition ${group} parameter 'quantity' with value '${getValue(
            'quantity'
          )}' is less than 1.`,
          `Please use “cardname != ${getValue('cardname')}” instead. Corrected.`,
        ]
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      })
      .flat(1),
  ];
  if (!warnings.warnings.length) delete warnings.warnings;

  // Filter query for valid query conditions.
  query = query.filter(obj => !ignoredGroups.includes(obj.group));
  // Throw error if no valid query conditions are found.
  if (_query.length && !query?.length) {
    return res.status(400).json({
      details: `Provided query ${
        ignoredGroups?.length == 1 ? 'condition' : 'conditions'
      } had one or more invalid parameters.`,
      ...Object.keys(warnings)
        .sort()
        .reduce((r, k) => ((r[k] = warnings[k]), r), {}),
    });
  }
  query.forEach((obj, _i) => {
    if (obj.parameter == 'quantity' && obj.value <= 0) {
      const queryGroup = query.filter(_obj => _obj.group == obj.group);
      if (queryGroup.length && queryGroup.find(_obj => _obj.parameter == 'cardname')) {
        query = query
          .map((condition, i) => {
            if (condition.group == obj.group && condition.parameter == 'cardname') {
              return { ...condition, operator: '!=' };
            } else if (_i !== i) return condition;
            return;
          })
          .filter(Boolean);
      } else query = query.filter(_obj => _obj.group != obj.group);
    }
  });

  // Get event catalog and parsed parameters.
  const { parameters, data: request_1 } = await eventsQuery(req.query, uids);

  // Handle erronous parameters.
  const _format = [...(parameters?.format || parameters?.formats || [])];
  if (
    _format &&
    ![_format].flat(1).filter(format => MTGO.FORMATS.includes(format.toLowerCase()))
  ) {
    return res.status(400).json({ details: "No valid 'format' parameter provided." });
  }
  if (parameters?.time_interval && parameters?.time_interval <= 0) {
    return res
      .status(400)
      .json({ details: "'time_interval' parameter must be greater than zero." });
  }
  // Find unmatched formats from event results
  const unmatchedFormats = (
    typeof parameters?.format == 'object'
      ? [...new Set(parameters?.format)]
      : [parameters?.format]
  )
    .filter(format => !MTGO.FORMATS.includes(format?.toLowerCase()))
    .filter(Boolean);
  // Find unmatched event types from event results
  const unmatchedTypes = (
    typeof (parameters?.type || parameters?.types) == 'object'
      ? [...new Set(parameters?.type || parameters?.types)]
      : [parameters?.type || parameters?.types]
  )
    .filter(type => !MTGO.EVENT_TYPES.includes(type?.toLowerCase()))
    .filter(Boolean);
  // Find unmatched event uids from event results
  const unmatchedUIDs = [...new Set(uids)].filter(
    uid => ![...new Set(request_1.map(obj => obj.uid.toString()))].includes(uid)
  );
  // Add additional warnings for mismatches
  if ([...unmatchedFormats, ...unmatchedTypes].length) {
    // Invalid format and/or event types might create erronous warnings for invalid event ids.
    warnings.errors = [
      ...unmatchedFormats.map(
        format => `The format parameter '${format}' does not exist.`
      ),
      ...unmatchedTypes.map(type => `The event type parameter '${type}' does not exist.`),
    ];
  } else if (unmatchedUIDs.length) {
    // Show invalid event ids once format type and/or event type is valid.
    warnings.errors = [
      ...unmatchedUIDs.map(uid => `The event id parameter '${uid}' could not be found.`),
    ];
  }
  // Throw error if no event data is found.
  if (!request_1[0]) {
    return res.status(404).json({ details: 'No event data was found.', ...warnings });
  }

  // Get unique formats from matched events.
  const formats = MTGO.FORMATS.filter(format =>
    [...new Set(request_1.map(obj => obj.format.toLowerCase()))].includes(format)
  );

  // Get event results from event catalog.
  const request_2 = await sql.unsafe(`
    SELECT * from results
    WHERE event in (${request_1.map(obj => obj.uid)});
  `);
  if (!request_2[0]) {
    return res.status(404).json({ details: 'No archetype data was found.', ...warnings });
  }
  // Get approx total players and swiss distribution per event.
  const eventRecords = [...new Set(request_2.map(obj => obj.event))]
    .map(uid => {
      const records = request_2
        .filter(obj => obj.event == uid)
        .map(obj => obj?.stats?.record);
      const recordData = [...new Set(records)]
        .map(record => ({
          record,
          count: records.filter(_record => _record == record).length,
        }))
        .sort(
          (a, b) => parseInt(b.record.split('-')[0]) - parseInt(a.record.split('-')[0])
        );
      return {
        [uid]: calculateEventStats(recordData),
      };
    })
    .flat(1)
    .reduce((a, b) => ({ ...a, ...b }));

  // Parse results for valid archetypes.
  const archetypes = request_2
    .map(obj => {
      if (obj.archetype === {}) return;
      const archetype0 = obj.archetype[Object.keys(obj.archetype)[0]];
      if (!archetype0?.uid) return;
      return {
        // ...(({ archetype, ...others }) => others)(obj),
        ...obj,
        archetype_uid: archetype0.uid,
        displayName: [...archetype0.alias, archetype0.displayName].filter(Boolean)[0],
        algorithm: Object.keys(obj.archetype)[0],
      };
    })
    .filter(Boolean);

  // Parse archetype decklists for valid cards.
  const cards = archetypes
    .map(obj =>
      [
        ...obj.deck?.mainboard.map(_obj => ({
          cardname: _obj.cardName,
          quantity: _obj.quantity,
          container: 'mainboard',
        })),
        ...obj.deck?.sideboard.map(_obj => ({
          cardname: _obj.cardName,
          quantity: _obj.quantity,
          container: 'sideboard',
        })),
      ].map(_obj => ({
        uid: null, // cards-database uid
        ..._obj,
        deck_uid: obj.uid,
        archetype_uid: obj.archetype_uid,
        displayName: obj.displayName,
        event: obj.event,
      }))
    )
    .filter(Boolean)
    .flat(1);

  // Parse archetype decklists for valid card matches and filter against query conditions.
  const decks = formats
    .map(format => {
      const _formatData = cards.filter(card =>
        request_1
          .filter(_obj => _obj.format.toLowerCase() === format)
          .map(_obj => _obj.uid)
          .includes(card.event)
      );
      let formatData = _formatData;
      [...new Set(query.map(obj => obj.group))].filter(Boolean).forEach(group => {
        const _query = query.filter(_obj => _obj.group == group);
        const filteredUIDs = [...new Set(formatData.map(_obj => _obj.deck_uid))]
          .map(_uid => {
            const filteredData = _formatData
              .filter(obj => obj.deck_uid == _uid)
              .filter(_data => {
                const _filter = _query
                  .map(_condition => {
                    const { parameter, operator, value } = _condition;
                    switch (operator) {
                      case '>=':
                        return _data[parameter] >= value;
                      case '<=':
                        return _data[parameter] <= value;
                      case '>':
                        return _data[parameter] > value;
                      case '<':
                        return _data[parameter] < value;
                      case '=':
                        return _data[parameter] == value;
                      case '!=': {
                        const data = formatData.filter(
                          obj => obj.deck_uid == _data.deck_uid && obj[parameter] == value
                        )?.length;
                        return data == 0 && _data[parameter] !== value;
                      }
                    }
                  })
                  .filter(Boolean);
                return _filter?.length == _query?.length;
              });
            return filteredData?.length ? _uid : null;
          })
          .filter(_uid => _uid !== null);
        formatData = formatData.filter(obj => filteredUIDs.includes(obj.deck_uid));
      });
      return {
        [format]: {
          object: 'catalog',
          count: [...new Set(formatData.map(_obj => _obj.deck_uid))]?.length,
          percentage:
            (
              ([...new Set(formatData.map(_obj => _obj.deck_uid))]?.length /
                [...new Set(_formatData.map(_obj => _obj.deck_uid))]?.length) *
              100
            ).toFixed(2) + '%',
          unique: [...new Set(formatData.map(_obj => _obj.archetype_uid))]?.length,
          data: archetypes
            .filter(
              archetype =>
                request_1
                  .filter(_obj => _obj.format.toLowerCase() === format)
                  .map(_obj => _obj.uid)
                  .includes(archetype.event) &&
                [...new Set(formatData.map(_obj => _obj.deck_uid))].includes(
                  archetype.uid
                )
            )
            .sort(dynamicSortMultiple('-count', 'displayName')),
        },
      };
    })
    .reduce((a, b) => ({ ...a, ...b }));

  // Return collection object.
  return res.status(200).json({
    object: 'collection',
    parameters: pruneObjectKeys({
      ...parameters,
      ...{
        query: [...new Set(query.map(obj => obj.group))]
          .filter(Boolean)
          .filter(group => !ignoredGroups.includes(group))
          .map(group =>
            query
              .filter(obj => obj.group == group)
              .map(_obj =>
                [
                  _obj.parameter.toLowerCase(),
                  _obj.operator,
                  !isNaN(_obj.value) ? _obj.value : `'${_obj.value || ''}'`,
                ].join(' ')
              )
              .join(' and ')
          )
          .flat(1),
      },
    }),
    ...Object.keys(warnings)
      .sort()
      .reduce((r, k) => ((r[k] = warnings[k]), r), {}),
    data: formats
      .map(format => {
        const _events = request_1.filter(
          _obj =>
            _obj.format.toLowerCase() === format &&
            [...new Set(decks[format].data.flat(1).map(obj => obj.event))].includes(
              _obj.uid
            )
        );
        const _archetypes = decks[format].data;
        const _formatData = cards.filter(card =>
          request_1
            .filter(_obj => _obj.format.toLowerCase() === format)
            .map(_obj => _obj.uid)
            .includes(card.event)
        );
        const _cards = cards.filter(card =>
          _archetypes
            .flat(2)
            .map(obj => obj.uid)
            .includes(card.deck_uid)
        );
        return {
          [format]: {
            events: {
              object: 'collection',
              count: _events?.length,
              unique: [...new Set(_events.map(obj => obj.type))].length,
              types: [...new Set(_events.map(obj => obj.type))],
              data: _events.map((obj, i) => ({
                object: 'event',
                uid: obj.uid,
                url: `https://magic.wizards.com/en/articles/archive/mtgo-standings/${obj.uri}`,
                type: obj.type,
                date: obj.date,
                stats: {
                  obsPlayers: eventRecords[obj.uid].obsPlayers, //.truncPlayers,
                  obsSwiss: eventRecords[obj.uid].truncTriangle,
                  obsArchetypes: [
                    ...new Set(
                      _archetypes
                        .filter(archetype => obj.uid == archetype.event)
                        .map(obj => obj.archetype_uid)
                    ),
                  ].length,
                  truncated: eventRecords[obj.uid].truncated,
                  approxPlayers: eventRecords[obj.uid].numPlayers,
                  approxSwiss: eventRecords[obj.uid].triangle,
                },
                data: _archetypes
                  .filter(_obj => _obj.event == obj.uid)
                  .map(_obj => {
                    const archetype0 =
                      _obj.archetype !== {}
                        ? _obj.archetype[Object.keys(_obj.archetype)[0]]
                        : {};
                    const tiebreakers = _obj.stats?.GWP
                      ? {
                          tiebreakers: {
                            MWP:
                              (
                                (parseInt(_obj.stats.record.split('-')[0]) /
                                  _obj.stats.record
                                    .split('-')
                                    .map(x => parseInt(x))
                                    .reduce((a, b) => a + b, 0)) *
                                100
                              ).toFixed(2) + '%',
                            GWP: ((_obj.stats?.GWP || 0) * 100).toFixed(2) + '%',
                            OGWP: ((_obj.stats?.OGWP || 0) * 100).toFixed(2) + '%',
                            OMWP: ((_obj.stats?.OMWP || 0) * 100).toFixed(2) + '%',
                          },
                        }
                      : {};

                    return {
                      object: 'event-result',
                      uid: _obj.uid,
                      username: _obj.username,
                      url: _obj.url,
                      archetype: {
                        object: 'archetype',
                        uid: archetype0?.uid || null,
                        displayName:
                          [
                            ...(archetype0?.alias || []),
                            archetype0?.displayName || [],
                          ].filter(Boolean)[0] || null,
                        algorithm: Object.keys(_obj.archetype)[0],
                      },
                      deck: {
                        mainboard: _obj.deck?.mainboard.map(__obj => ({
                          object: 'card',
                          uid: null,
                          cardname: __obj.cardName,
                          quantity: __obj.quantity,
                        })),
                        sideboard: _obj.deck?.sideboard.map(__obj => ({
                          object: 'card',
                          uid: null,
                          cardname: __obj.cardName,
                          quantity: __obj.quantity,
                        })),
                      },
                      stats: {
                        record: _obj.stats.record,
                        points: _obj.stats.points,
                        rank: _obj.stats.rank,
                        ...tiebreakers,
                      },
                    };
                  })
                  .filter(Boolean),
              })),
            },
            archetypes: {
              object: 'catalog',
              count: _archetypes.length,
              percentage:
                (
                  (_archetypes.length /
                    [...new Set(_formatData.map(_obj => _obj.deck_uid))]?.length) *
                  100
                ).toFixed(2) + '%',
              unique: [...new Set(_archetypes.map(_obj => _obj.archetype_uid))]?.length,
              data: [...new Set(_archetypes.map(_obj => _obj.archetype_uid))]
                .map(_uid => ({
                  object: 'archetype',
                  uid: _uid,
                  displayName: _archetypes.filter(_obj => _obj.archetype_uid == _uid)[0]
                    .displayName,
                  count: _archetypes.filter(_obj => _obj.archetype_uid == _uid).length,
                  percentage:
                    (
                      ([
                        ...new Set(
                          _archetypes.filter(_obj => _obj.archetype_uid == _uid)
                        ),
                      ]?.length /
                        archetypes.length) *
                      100
                    ).toFixed(2) + '%',
                }))
                .sort(dynamicSortMultiple('-count', 'displayName')),
            },
            cards: {
              object: 'catalog',
              count: _cards?.length,
              unique: [...new Set(_cards.map(obj => obj.cardname))].length,
              types: [],
              data: _cards
                .filter(
                  (obj, i) =>
                    _cards.findIndex(_obj => _obj.cardname === obj.cardname) === i
                )
                .map(obj => ({
                  object: 'card',
                  uid: obj.uid,
                  cardname: obj.cardname,
                  count: [
                    ...new Set(
                      _cards
                        .filter(_obj => _obj.cardname === obj.cardname)
                        .map(_obj => _obj.deck_uid)
                    ),
                  ].length,
                  percentage:
                    parseFloat(
                      ([
                        ...new Set(
                          _cards
                            .filter(_obj => _obj.cardname === obj.cardname)
                            .map(_obj => _obj.deck_uid)
                        ),
                      ].length /
                        [...new Set(_cards.map(_obj => _obj.deck_uid))].length) *
                        100
                    ).toFixed(2) + '%',
                  average: parseFloat(
                    (
                      _cards
                        .filter(_obj => _obj.cardname === obj.cardname)
                        .map(_obj => _obj.quantity)
                        .reduce((a, b) => a + b) /
                      [
                        ...new Set(
                          _cards
                            .filter(_obj => _obj.cardname === obj.cardname)
                            .map(_obj => _obj.deck_uid)
                        ),
                      ].length
                    ).toFixed(2)
                  ),
                  container: [
                    ...new Set(
                      _cards
                        .filter(_obj => _obj.cardname === obj.cardname)
                        .map(_obj => _obj.container)
                    ),
                  ],
                }))
                .sort(dynamicSortMultiple('-count', '-average', 'cardname')),
            },
          },
        };
      })
      .flat(1)
      .reduce((a, b) => ({ ...a, ...b })),
  });
};

export default Metagame;
