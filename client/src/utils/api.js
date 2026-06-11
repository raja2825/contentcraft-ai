import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // ← send cookies automatically
});

// No more manual token attachment needed
// Cookie is sent automatically by browser

export default API;