async function adicionarPontos() {

    if (!usuarioSelecionado)
        return;

    let valor = Number(document.getElementById("valor").value);

    let motivo = document.getElementById("motivo").value;

    await db
        .collection("usuarios")
        .doc(usuarioSelecionado)
        .update({

            points: firebase.firestore.FieldValue.increment(valor)

        });

    await db
        .collection("historico_pontos")
        .add({

            usuario: usuarioSelecionado,

            telefone: dadosUsuario.telefone,

            nome: dadosUsuario.nome,

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
        .collection("usuarios")
        .doc(usuarioSelecionado)
        .update({

            points: firebase.firestore.FieldValue.increment(-valor)

        });

    await db
        .collection("historico_pontos")
        .add({

            usuario: usuarioSelecionado,

            telefone: dadosUsuario.telefone,

            nome: dadosUsuario.nome,

            valor: -valor,

            motivo: motivo,

            admin: firebase.auth().currentUser.uid,

            data: firebase.firestore.FieldValue.serverTimestamp()

        });

    alert("Pontos removidos!");

    buscarUsuario();

}
