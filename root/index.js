/*
  File for generating a root certificates for the root Identity Registrar servers.
  Identity Registrar servers provide client certificates that are locked to a specific verified universal messenger account.
*/
(async () => {
  const state = {
    type: 'Certificate Creation',
    utility: require('Lucy')
  };
  await require('../console/')(state);
  await require('./file/')(state);
  await require('../crypto/')(state);
  await require('./sign/')(state);
  await require('./keys/')(state);
  const {
    api,
    crypto: {
      signOpen,
      toBuffer,
    },
    utility: {
      stringify
    },
    cnsl,
    warn,
    success,
    alert
  } = state;
  const additionalEphemeral = {
    id: '1',
    version: 1,
    host: 'identity.registrar',
    ip: '192.168.1.1',
    port: 80,
    pad: 900,
    issuer: 'Sentivate',
    issuerID: '0',
    algo: 'default',
    end: Date.now() + 100000000000,
    master: '0'
  };
  const additionalMaster = {
    version: 1,
    algo: 'default',
    id: '0',
    type: 'root',
    issuer: 'Sentivate',
    issuerID: '0',
    country: 'US',
    contact: 'issuer',
    end: Date.now() + 100000000000,
  };
  const certificates = await api.create(__dirname, additionalEphemeral, additionalMaster);
  const ephemeral = certificates.certificates.ephemeral;
  const master = certificates.certificates.master;
  cnsl('------------EPHEMERAL KEY------------');
  const bufferedSignature = toBuffer(ephemeral.signature);
  const signature = signOpen(bufferedSignature, certificates.keypairs.master.publicKey);
  if (signature) {
    success('Ephemeral Signature is valid');
  }
  alert('Ephemeral Certificate', ephemeral.data, `SIZE: ${stringify(ephemeral.data).length}bytes`);
  cnsl('------------MASTER KEY------------');
  if (master.signature) {
    const bufferedSignatureMaster = toBuffer(master.signature);
    const signatureMaster = signOpen(bufferedSignatureMaster, certificates.keypairs.master.publicKey);
    if (signatureMaster) {
      success('Master Signature is valid');
    }
  }
  alert('Master Certificate', master.data, `SIZE: ${stringify(master.data).length}bytes`);
  cnsl('------------TOTAL KEYPAIR SIZE------------');
  warn(`SIZE: ${stringify(ephemeral.data).length + stringify(master.data).length}bytes`);
})();
