jest.mock('request-promise-native');

import * as fs from 'fs';
import * as path from 'path';
import * as queryString from 'query-string';
import * as mockedRequest from 'request-promise-native';

const ASSETS_PATH = path.resolve(path.join(__dirname, 'assets'));

/**
 * Get expected responses from ./tests/assets/*.json, based on given
 * `input` or `placeId`
 */
((mockedRequest as any) as jest.Mock).mockImplementation((query: any): Promise<any> => {
  const { uri } = query;
  const queryParam = uri.substring(uri.lastIndexOf('?'));
  const { input, placeid, latlng } = queryString.parse(queryParam);
  const mockFilename = `${input || placeid || latlng || 'INVALID_MOCK'}.json`;

  const content = fs.readFileSync(path.join(ASSETS_PATH, mockFilename));

  return JSON.parse(content.toString());
});

export { mockedRequest };
