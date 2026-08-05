async function buscarUsuario() {

    const valorDigitado = document
        .getElementById("telefone")
        .value
        .trim();

    if (!valorDigitado) {
        alert("Digite um telefone ou email para buscar.");
        return;
    }

    const ehEmail = valorDigitado.includes("@");

    let campo;
    let valorBusca;

    if (ehEmail) {
        campo = "email";
        valorBusca = valorDigitado.toLowerCase();
    } else {
        campo = "telefone";
        valorBusca = valorDigitado.replace(/\D/g, "");

        // Remove o DDI 55 (Brasil) se foi digitado, pra não divergir do que
        // foi salvo no cadastro sem DDI.
        if (valorBusca.length > 11 && valorBusca.startsWith("55")) {
            valorBusca = valorBusca.slice(2);
        }
    }

    let snap;
    try {
        snap = await db
            .collection("users")
            .where(campo, "==", valorBusca)
            .limit(1)
            .get();
    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        alert("Erro ao buscar usuário: " + err.message);
        return;
    }

    if (snap.empty) {

        alert("Usuário não encontrado.");
        return;

    }

    snap.forEach(doc => {

        usuarioSelecionado = doc.id;
        dadosUsuario = doc.data();

    });

    document.getElementById("nome").innerHTML =
        dadosUsuario.nome || "(sem nome)";

    document.getElementById("tel").innerHTML =
        dadosUsuario.telefone || "-";

    document.getElementById("email").innerHTML =
        dadosUsuario.email || "-";

    document.getElementById("points").innerHTML =
        dadosUsuario.points;

}
