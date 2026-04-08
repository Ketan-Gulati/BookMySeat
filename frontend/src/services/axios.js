import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true
});

//interceptor for response.....
instance.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    // If access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true;

      try {
        // call refresh token API
        await axios.patch(
          "https://bookmyseat-iuy2.onrender.com",
          {},
          { withCredentials: true }
        );

        // retry original request
        return instance(originalRequest);

      } catch (refreshError) {
        // refresh also failed.....then logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;