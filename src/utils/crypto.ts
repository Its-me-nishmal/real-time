import CryptoJS from "crypto-js";

export const encrypt = (text: string, key: string) => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      return "";
    }
    return originalText;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
};