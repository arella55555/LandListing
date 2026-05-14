import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.43.7:5000",
});

export default API;