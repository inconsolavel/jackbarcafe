// pontos.js
//
// CORREÇÃO: gravava em db.collection("usuarios") — coleção separada que o
// resto do site nunca lê. Os pontos adicionados/removidos aqui nunca
// refletiam na conta real do cliente (a que aparece em index.html/eventos.html,
// gravada em "users"). Agora usa "users", igual ao resto do site.

async function adicionarPontos() {

    if (!usuarioSelecionado)
        return;

    let valor = Number(document.getElementById("valor").value);

    let motivo = document.getElementById("motivo").value;

    await db
        .collection("users")
        .doc(usuarioSelecionado)
        .update({

            points: firebase.firestore.FieldValue.increment(valor)

        });

    await db
        .collection("historico_pontos")
        .add({

            usuario: usuarioSelecionado,

            email: dadosUsuario.email || "",

            nome: dadosUsuario.nome || "",

            valor: valor,

            motivo: motivo,

            admin: firebase.auth().currentUser.uid,

            data: firebase.firestore.FieldValue.serverTimestamp()

        });

    alert("Pontos adicionados!");

    buscarUsuario();

}

async function removerPontos() {

    if (!usuarioSelecionado)
        return;

    let valor = Number(document.getElementById("valor").value);

    let motivo = document.getElementById("motivo").value;

    await db
        .collection("users")
        .doc(usuarioSelecionado)
        .update({

            points: firebase.firestore.FieldValue.increment(-valor)

        });

    await db
        .collection("historico_pontos")
        .add({

            usuario: usuarioSelecionado,

            email: dadosUsuario.email || "",

            nome: dadosUsuario.nome || "",

            valor: -valor,

            motivo: motivo,

            admin: firebase.auth().currentUser.uid,

            data: firebase.firestore.FieldValue.serverTimestamp()

        });

    alert("Pontos removidos!");

    buscarUsuario();

}
