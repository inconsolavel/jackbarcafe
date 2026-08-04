// firebase-config.js
//
// CORREÇÃO: este arquivo estava escrito como módulo ES (`export const` +
// `import.meta.env...`), formato que só funciona com um bundler (Vite/Webpack).
// Como é carregado via <script src="firebase-config.js"></script> comum (sem
// type="module"), o navegador nunca conseguia interpretá-lo — e o Firebase
// nunca era inicializado no painel admin.
//
// Agora é um script clássico simples, igual ao padrão já usado em
// index.html, eventos.html, jackride.html e resgate.html.

const firebaseConfig = {
  apiKey: "AIzaSyCSXdOu9Cwly0-s9rySbe9jKb7fqhcz1p8",
  authDomain: "jackbarcafe-b8fa8.firebaseapp.com",
  projectId: "jackbarcafe-b8fa8",
  storageBucket: "jackbarcafe-b8fa8.appspot.com",
  messagingSenderId: "849215333925",
  appId: "1:849215333925:web:e02cb0d11c590af32201cc"
};

// Lista de e-mails com acesso de administrador (mesmo padrão usado em eventos.html/index.html)
const ADMIN_EMAILS = [
  // 'admin@jackbarcafe.com'
];

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
