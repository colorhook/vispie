import { customAlphabet } from "nanoid";
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const nanoid = customAlphabet(alphabet, 24);
export const shortid = customAlphabet(alphabet, 12);