// buscarUsuario.js
//
// CORREÇÃO: buscava em db.collection("usuarios").where("telefone", ...) —
// coleção e campo que não existem nos dados reais do site (as contas dos
// clientes ficam em "users", indexadas pelo uid do Firebase Auth, sem
// campo de telefone). Por isso a busca nunca encontrava ninguém.
//
// Agora busca em "users" pelo campo "email" (gravado automaticamente
// quando o cliente faz login/cadastro em index.html ou eventos.html).

async function buscarUsuario() {

    const email = document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    if (!email) {
        alert("Informe um e-mail.");
        return;
    }

    const snap = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (snap.empty) {

        alert("Usuário não encontrado.");
        usuarioSelecionado = null;
        dadosUsuario = null;
        document.getElementById("nome").innerHTML = "Nenhum usuário";
        document.getElementById("tel").innerHTML = "";
        document.getElementById("points").innerHTML = "0";
        return;

    }

    snap.forEach(doc => {

        usuarioSelecionado = doc.id;
        dadosUsuario = doc.data();

    });

    document.getElementById("nome").innerHTML =
        dadosUsuario.nome || dadosUsuario.email || "Sem nome";

    document.getElementById("tel").innerHTML =
        dadosUsuario.email || "-";

    document.getElementById("points").innerHTML =
        dadosUsuario.points ?? 0;

}
