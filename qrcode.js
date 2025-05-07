// qrcode.js
function startQrScanner(uid, callback) {
  const qrRegionId = "reader";
  const html5QrCode = new Html5Qrcode(qrRegionId);

  const config = { fps: 10, qrbox: 250 };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText, decodedResult) => {
      console.log(`QR Code detectado: ${decodedText}`);
      html5QrCode.stop();
      if (callback) callback(decodedText, uid);
    },
    errorMessage => {
      // console.warn(`Erro no scan: ${errorMessage}`);
    }
  );
}
