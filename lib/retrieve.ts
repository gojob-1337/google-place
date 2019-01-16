import { IGoogleAddressComponent, IPlace, IPlaceQuery, PlaceType } from './definition';
import { httpRequest } from './http-request';

const ENDPOINT_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

/** For a given `type`, provide a predicate looking for `type` in the types of the input component */
const findByType = (type: PlaceType) => (component: IGoogleAddressComponent) => component.types.includes(type);

/**
 * Consume Google Place API tp retrieve the details of a place
 *
 * @param query API Request configuration.
 *
 * @throws {Error} (rejects) if Response status is not 'OK' or if no result is provided.
 *
 * @return Resolve with an `IPlace` or rejects.
 */
export async function retrieve(query: IPlaceQuery): Promise<IPlace> {
  const { id: placeid, key, language } = query;
  const queryParams = {
    placeid,
    key,
    language,
  };

  const response = await httpRequest(ENDPOINT_URL, queryParams);

  if (response.status !== 'OK') {
    throw new Error(`Unexpected retrieve result: ${response.status}`);
  } else if (!response.result) {
    throw new Error('Result is missing');
  }

  const componentsKeys: PlaceType[] = [
    'street_number',
    'route',
    'locality',
    'administrative_area_level_1',
    'administrative_area_level_2',
    'country',
    'postal_code',
  ];
  const defaultComponent = { long_name: '', short_name: '', types: [] };
  // destructure components matching `componentsKeys`
  const [streetNumber, route, locality, administrativeAreaLevel1, administrativeAreaLevel2, country, postalCode] = componentsKeys
    .map(findByType)
    .map(fn => (response.result.address_components || []).find(fn) || defaultComponent);

  return {
    id: response.result.place_id,
    address: response.result.formatted_address,
    location: response.result.geometry.location,

    // address_components
    locality: locality.long_name || locality.short_name,
    administrativeAreaLevel1: administrativeAreaLevel1.long_name || administrativeAreaLevel1.short_name,
    administrativeAreaLevel2: administrativeAreaLevel2.long_name || administrativeAreaLevel2.short_name,
    countryCode: country.short_name,
    country: country.long_name,
    postalCode: postalCode.long_name,
    streetNumber: streetNumber.short_name,
    route: route.long_name,
  };
}
