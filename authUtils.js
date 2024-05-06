// authUtils.js

const TOKEN_KEY = 'arpita';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const setAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);
