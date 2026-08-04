// Inicializa o Firebase para todo o painel admin.
// (Antes, nenhum arquivo chamava firebase.initializeApp/firebase.auth()/
// firebase.firestore(), então "db" e "auth" não existiam e auth.js /
// buscarUsuario.js quebravam silenciosamente com "db is not defined".)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let usuarioSelecionado = null;

let dadosUsuario = null;
