import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiService {
  private axiosInstance: AxiosInstance;

  public constructor() {
    this.axiosInstance = axios.create({});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get<R = any>(url: string, options?: AxiosRequestConfig): Promise<R> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: AxiosResponse<any> = await this.axiosInstance.get(url, options);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error requesting API:', error);
      throw error;
    }
  }
}