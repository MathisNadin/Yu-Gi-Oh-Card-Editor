import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class AxiosService {
  private _axiosInstance!: AxiosInstance;

  // Getter for the Axios instance, initialized only once.
  private get axiosInstance(): AxiosInstance {
    if (!this._axiosInstance) {
      this._axiosInstance = axios.create({});
    }
    return this._axiosInstance;
  }

  // GET: Fetch resource from the server.
  public async get<R = unknown>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<R> | undefined> {
    try {
      const response = await this.axiosInstance.get<R>(url, options);
      return response;
    } catch (error) {
      console.error('GET request error:', error);
      return undefined;
    }
  }

  // POST: Send data to the server.
  public async post<T = unknown, R = unknown>(
    url: string,
    data?: T,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<R> | undefined> {
    try {
      const response = await this.axiosInstance.post<R, AxiosResponse<R>, T>(url, data, options);
      return response;
    } catch (error) {
      console.error('POST request error:', error);
      return undefined;
    }
  }

  // PUT: Replace resource on the server.
  public async put<T = unknown, R = unknown>(
    url: string,
    data?: T,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<R> | undefined> {
    try {
      const response = await this.axiosInstance.put<R, AxiosResponse<R>, T>(url, data, options);
      return response;
    } catch (error) {
      console.error('PUT request error:', error);
      return undefined;
    }
  }

  // PATCH: Partially update resource on the server.
  public async patch<T = unknown, R = unknown>(
    url: string,
    data?: T,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<R> | undefined> {
    try {
      const response = await this.axiosInstance.patch<R, AxiosResponse<R>, T>(url, data, options);
      return response;
    } catch (error) {
      console.error('PATCH request error:', error);
      return undefined;
    }
  }

  // DELETE: Delete resource from the server.
  public async delete<R = unknown>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<R> | undefined> {
    try {
      const response = await this.axiosInstance.delete<R>(url, options);
      return response;
    } catch (error) {
      console.error('DELETE request error:', error);
      return undefined;
    }
  }
}
