function startQrScanner(uid, db) {
  const qrRegionId = "reader";
  const html5QrCode = new Html5Qrcode(qrRegionId);
  let scanned = false;

  const config = { fps: 10, qrbox: 250 };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    async (decodedText, decodedResult) => {
      if (scanned) return;
      scanned = true;

      try {
        const qrRef = db.collection("used_qrcodes").doc(decodedText);
        const qrDoc = await qrRef.get();

        if (qrDoc.exists) {
          alert("Este QR Code já foi usado.");
        } else {
          await qrRef.set({
            uid: uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });

          const points = parseInt(decodedText) || 10;
          await db.collection("users").doc(uid).set({
            points: firebase.firestore.FieldValue.increment(points)
          }, { merge: true });

          alert(`+${points} pontos adicionados!`);
        }
      } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        alert("Erro ao processar QR Code.");
      } finally {
        html5QrCode.stop().then(() => {
          document.getElementById(qrRegionId).style.display = "none";
        });
      }
    },
    errorMessage => {
      // Erros de leitura ignorados normalmente
    }
  ).catch(err => {
    console.error("Erro ao iniciar o scanner:", err);
  });
}
