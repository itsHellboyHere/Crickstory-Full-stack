import axios from 'axios';
import Cookies from 'js-cookie';



const instance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  
});
// Add CSRF token to unsafe methods
instance.interceptors.request.use(config => {
  const csrfToken = Cookies.get('csrftoken');

  if (
    config.method &&
    ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase()) &&
    csrfToken
  ) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
}, error => Promise.reject(error));

instance.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    const isRefreshUrl = originalRequest.url.includes('/api/auth/token/refresh/');
    const isUserUrl = [
      '/api/auth/user/',
      '/api/user/profile/',
    ].some((url) => originalRequest.url.includes(url));
    const isLogoutUrl = originalRequest.url.includes('/api/auth/logout/');

    // Don't intercept logout errors or refresh token requests
    if (isLogoutUrl || isRefreshUrl) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await instance.post('/api/auth/token/refresh/', {}, { 
          withCredentials: true 
        });
        
        // Retry the original request with new token
        return instance(originalRequest);
      } catch (refreshError) {
        // Only redirect if not a user request and we're in the browser
        if (!isUserUrl && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;


