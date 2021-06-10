import React from 'react';
import axios from 'axios';
import {
  useAuthActions,
  useAuthOrganizationId,
  useSetGlobalErrors,
  useAuthToken,
} from './state';

export default function useApiRequest() {
  const setGlobalErrors = useSetGlobalErrors();
  const { setLogout } = useAuthActions();

  // Authentication token.
  const token = useAuthToken();

  // Authentication organization id.
  const organizationId = useAuthOrganizationId();

  const http = React.useMemo(() => {
    // Axios instance.
    const instance = axios.create();

    // Request interceptors.
    instance.interceptors.request.use(
      (request) => {
        const locale = 'ar';

        if (token) {
          request.headers.common['X-Access-Token'] = token;
        }
        if (organizationId) {
          request.headers.common['organization-id'] = organizationId;
        }
        if (locale) {
          request.headers.common['Accept-Language'] = locale;
        }
        return request;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    // Response interceptors.
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const { status } = error.response;

        if (status >= 500) {
          setGlobalErrors({ something_wrong: true });
        }
        if (status === 401) {
          setGlobalErrors({ session_expired: true });
          setLogout();
        }
        return Promise.reject(error);
      },
    );
    return instance;
  }, [token, organizationId, setGlobalErrors, setLogout]);

  return {
    http,

    get(resource, params) {
      return http.get(`/api/${resource}`, params);
    },

    post(resource, params, config) {
      return http.post(`/api/${resource}`, params, config);
    },

    update(resource, slug, params) {
      return http.put(`/api/${resource}/${slug}`, params);
    },

    put(resource, params) {
      return http.put(`/api/${resource}`, params);
    },

    delete(resource, params) {
      return http.delete(`/api/${resource}`, params);
    },
  };
}
