// firebase-config.js
// Config carregada como <script> normal (não como módulo ES), por isso não
// pode usar "export" nem "import.meta.env" — isso quebrava a página inteira
// com "Unexpected token 'export'" e impedia admin.js/auth.js de rodarem.
const firebaseConfig = {
  apiKey: "AIzaSyCSXdOu9Cwly0-s9rySbe9jKb7fqhcz1p8",
  authDomain: "jackbarcafe-b8fa8.firebaseapp.com",
  projectId: "jackbarcafe-b8fa8",
  storageBucket: "jackbarcafe-b8fa8.appspot.com",
  messagingSenderId: "849215333925",
  appId: "1:849215333925:web:e02cb0d11c590af32201cc"
};
