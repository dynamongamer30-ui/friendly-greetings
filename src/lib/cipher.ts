import CryptoJS from 'crypto-js'

const AES_KEY = "DynamonGamer_Secure_AES_Key_2026"

export const Cipher = {
  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, AES_KEY).toString()
  },
  decrypt(cipherText: string): string {
    return CryptoJS.AES.decrypt(cipherText, AES_KEY).toString(CryptoJS.enc.Utf8)
  },
}
