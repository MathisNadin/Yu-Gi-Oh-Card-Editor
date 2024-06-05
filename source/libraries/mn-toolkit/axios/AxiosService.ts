import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class AxiosService {
  private _axiosInstance!: AxiosInstance;

  private get axiosInstance() {
    if (!this._axiosInstance) {
      this._axiosInstance = axios.create({});
    }
    return this._axiosInstance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get<R = any>(url: string, options?: AxiosRequestConfig): Promise<R> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: AxiosResponse<any> = await this.axiosInstance.get(url, options);
      return response.data;
    } catch (error) {
      console.error('Error requesting API:', error);
      throw error;
    }
  }
}
