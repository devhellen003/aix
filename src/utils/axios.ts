import axios, { AxiosInstance } from 'axios';

/**
 * Creates an Axios instance configured for the Bots API service.
 * @param {string} baseURL - API base url.
 * @param {string} address - The user's address for token retrieval.
 * @param {Function} onUnauthorized - Callback function to execute on a 401 (Unauthorized) response.
 * @returns {AxiosInstance} An Axios instance with configured interceptors.
 */
export const createApiService = (
  baseURL: string,
  address: string,
  onUnauthorized: () => void,
): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL,
  });

  const token = getTokenForAddress(address);

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

/**
 * Retrieves the token from local storage for a given address.
 * @param {string} address - The user's address for which the token is stored.
 * @returns {string | null} The retrieved token, or null if not found.
 */
const getTokenForAddress = (address: string): string | null => {
  return localStorage.getItem(`token-${address}`);
};
