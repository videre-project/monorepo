import { MTGO } from '@videre/magic';

export function getEventErrors(parameters, uids, request_1) {
  let errors = [];
  // Find unmatched formats from event results
  const unmatchedFormats =
    (typeof parameters?.format == 'object'
      ? [...new Set(parameters?.format)]
      : [parameters?.format])
    .filter(format => !MTGO.FORMATS.includes(format?.toLowerCase()))
    .filter(Boolean);
  // Find unmatched event types from event results
  const unmatchedTypes =
    (typeof (parameters?.type || parameters?.types) == 'object'
      ? [...new Set(parameters?.type || parameters?.types)]
      : [parameters?.type || parameters?.types])
    .filter(type => !MTGO.EVENT_TYPES.includes(type?.toLowerCase()))
    .filter(Boolean);
  // Find unmatched event uids from event results
  const unmatchedUIDs = [...new Set(uids)]
    .filter(
      uid => ![...new Set(
        request_1.map(obj => obj.uid.toString())
      )].includes(uid)
    );
  // Add additional warnings for mismatches
  if ([...unmatchedFormats, ...unmatchedTypes].length) {
    // Invalid format and/or event types might create erronous warnings for invalid event ids.
    errors = [
      ...unmatchedFormats.map(
        format => `The format parameter '${format}' does not exist.`
      ),
      ...unmatchedTypes.map(type => `The event type parameter '${type}' does not exist.`),
    ];
  } else if (unmatchedUIDs.length) {
    // Show invalid event ids once format type and/or event type is valid.
    errors = [
      ...unmatchedUIDs.map(uid => `The event id parameter '${uid}' could not be found.`),
    ];
  };

  return errors;
};