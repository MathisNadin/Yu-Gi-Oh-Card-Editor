/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prettier/prettier */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiService {

  private axiosInstance: AxiosInstance;

  public constructor() {
    this.axiosInstance = axios.create({});
  }

  public async get(url: string, options?: AxiosRequestConfig): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.axiosInstance.get(url, options);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error requesting API:', error);
      throw error;
    }
  }
}
