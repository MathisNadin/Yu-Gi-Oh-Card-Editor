/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prettier/prettier */

import axios, { AxiosResponse } from 'axios';

export class ApiService {

  public async get(url: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axios.get(url);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error requesting API:', error);
      throw error;
    }
  }
}
